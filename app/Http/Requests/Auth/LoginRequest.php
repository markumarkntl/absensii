<?php

namespace App\Http\Requests\Auth;

use App\Models\StudentDetail;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 'identifier' bisa berupa email (admin) atau NISN (siswa)
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string'],
        ];
    }

    /**
     * Custom attribute names for validation messages.
     */
    public function attributes(): array
    {
        return [
            'identifier' => 'email / NISN',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * Deteksi otomatis:
     *  - Mengandung '@'  → login sebagai Admin via email
     *  - Tidak ada '@'   → login sebagai Siswa via NISN
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $identifier = $this->string('identifier')->toString();
        $password   = $this->string('password')->toString();

        $authenticated = str_contains($identifier, '@')
            ? $this->attemptAdminLogin($identifier, $password)
            : $this->attemptStudentLogin($identifier, $password);

        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'identifier' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Login Admin menggunakan email + password.
     */
    private function attemptAdminLogin(string $email, string $password): bool
    {
        return Auth::attempt(
            ['email' => $email, 'password' => $password],
            $this->boolean('remember')
        );
    }

    /**
     * Login Siswa menggunakan NISN + password.
     *
     * Alur:
     *  1. Cari NISN di tabel student_details
     *  2. Ambil user yang terhubung
     *  3. Verifikasi password user tersebut
     */
    private function attemptStudentLogin(string $nisn, string $password): bool
    {
        $studentDetail = StudentDetail::where('nisn', $nisn)
            ->with('user')
            ->first();

        if (! $studentDetail || ! $studentDetail->user) {
            return false;
        }

        return Auth::attempt(
            ['email' => $studentDetail->user->email, 'password' => $password],
            $this->boolean('remember')
        );
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'identifier' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     * Gunakan 'identifier' (bukan 'email') sebagai basis throttle key.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('identifier')) . '|' . $this->ip()
        );
    }
}
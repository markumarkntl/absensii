<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Nama Sekolah
    |--------------------------------------------------------------------------
    */
    'school_name' => env('SASS_SCHOOL_NAME', 'SMA Contoh'),

    /*
    |--------------------------------------------------------------------------
    | Koordinat Lokasi Sekolah
    | Ambil dari Google Maps: klik kanan lokasi → "Salin koordinat"
    |--------------------------------------------------------------------------
    */
    'school_lat' => env('SASS_SCHOOL_LAT', -7.2575),
    'school_lng' => env('SASS_SCHOOL_LNG', 112.7521),

    /*
    |--------------------------------------------------------------------------
    | Radius Absen (meter)
    | Siswa harus berada dalam radius ini dari sekolah untuk bisa absen.
    |--------------------------------------------------------------------------
    */
    'attendance_radius_meters' => (int) env('SASS_ATTENDANCE_RADIUS', 200),

    /*
    |--------------------------------------------------------------------------
    | Batas Jam Absen (H:i:s)
    | Setelah jam ini siswa tidak bisa absen manual.
    | Cron job akan auto-Alfa siswa yang belum absen.
    |--------------------------------------------------------------------------
    */
    'attendance_deadline' => env('SASS_ATTENDANCE_DEADLINE', '10:00:00'),

/*
|--------------------------------------------------------------------------
| Batas Jam Terlambat (H:i:s)
| Siswa yang absen setelah jam ini dianggap TERLAMBAT
| dan harus mengajukan izin hadir terlambat ke admin.
|--------------------------------------------------------------------------
*/
'attendance_late' => env('SASS_ATTENDANCE_LATE', '07:00:00'),

/*
|--------------------------------------------------------------------------
| Jam Absen Mulai Dibuka (H:i:s)
|--------------------------------------------------------------------------
*/
'attendance_open' => env('SASS_ATTENDANCE_OPEN', '06:00:00'),

/*
|--------------------------------------------------------------------------
| Jam Pulang
| Siswa bisa check-out mulai jam checkout_open.
|--------------------------------------------------------------------------
*/
'checkout_open'     => env('SASS_CHECKOUT_OPEN',     '14:00:00'),
'checkout_deadline' => env('SASS_CHECKOUT_DEADLINE',  '17:00:00'),

];
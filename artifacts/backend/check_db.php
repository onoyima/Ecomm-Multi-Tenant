<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
$counts = [];

foreach ($tables as $table) {
    try {
        $counts[$table->table_name] = DB::table($table->table_name)->count();
    } catch (\Exception $e) {
        $counts[$table->table_name] = 'error: ' . $e->getMessage();
    }
}

echo json_encode($counts, JSON_PRETTY_PRINT);

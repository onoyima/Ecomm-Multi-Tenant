<?php
try {
    $pdo = new PDO('pgsql:host=localhost;port=5432;dbname=postgres', 'postgres', 'password');
    $stmt = $pdo->query("SELECT datname FROM pg_database WHERE datistemplate = false");
    $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $results = [];
    foreach ($dbs as $db) {
        try {
            $pdoDb = new PDO("pgsql:host=localhost;port=5432;dbname=$db", 'postgres', 'password');
            $stmt = $pdoDb->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $results[$db] = $tables;
        } catch (Exception $e) {
            $results[$db] = "Could not connect: " . $e->getMessage();
        }
    }
    
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Connection error: " . $e->getMessage();
}

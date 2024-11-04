<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "stockin_db";

// 创建数据库连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接是否成功
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>

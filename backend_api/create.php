<?php
header("Content-Type: application/json");

include 'db_connect.php';

// 获取 POST 数据
$containernumbers = explode("\n", trim($_POST['containerNumbers'])); // 将输入的 containernumbers 按换行符拆分成数组，并去除首尾空格
$clientnames = explode("\n", trim($_POST['clientNames'])); // 将输入的 clientnames 按换行符拆分成数组，并去除首尾空格
$unloaddate = trim($_POST['unloadDate']); // 去除 unloaddate 的首尾空格

// 遍历输入的 containernumbers 和 clientnames，执行批量插入操作
$insertedCount = 0;
for ($i = 0; $i < count($containernumbers); $i++) {
    // 去除 containernumber 和 clientname 的前后空格
    $containernumber = trim($containernumbers[$i]);
    $clientname = trim($clientnames[$i]);
    // 执行插入操作
    $sql = "INSERT INTO containerInfo (containerNumber, clientName, unloadDate) VALUES ('$containernumber', '$clientname', '$unloaddate')";
    if ($conn->query($sql) === TRUE) {
        $insertedCount++;
    }
}

if ($insertedCount > 0) {
    echo json_encode(["message" => "$insertedCount records inserted successfully"]);
} else {
    echo json_encode(["message" => "No records inserted"]);
}

$conn->close();
?>

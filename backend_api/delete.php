<?php
global $conn;
header("Content-Type: application/json");

include 'db_connect.php';

$id = $_POST['id'];

$sql = "DELETE FROM containerInfo WHERE id=$id";
if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Record deleted successfully"]);
} else {
    echo json_encode(["message" => "Error deleting record: " . $conn->error]);
}

$conn->close();
?>

<?php
include 'connection.php';

$id = $_POST['id'];
$department = $_POST['department'];
$issue = $_POST['issue'];
$responsibleSignature = $_POST['responsible_signature'];
$reporterSignature = $_POST['reporter_signature'];
$date = $_POST['date'];

$sql = "UPDATE departmentIssues SET department = ?, issue = ?, responsible_signature = ?, reporter_signature = ?, date = ? WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssi", $department, $issue, $responsibleSignature, $reporterSignature, $date, $id);

if ($stmt->execute()) {
    echo "Record updated successfully";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>

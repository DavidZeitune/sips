<?php
require 'lib_php/db.php';
require 'lib_php/user.php';

$username = filter_var($_POST["username"]);
$password = filter_var($_POST["password"]);

$user = new UserLogin($db);
if ($user->confirm_login()) {
    echo file_get_contents("view/spice.html");
} else {
    header("location: login.php");
}

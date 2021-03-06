<?php

require 'lib_php/db.php';
require 'lib_php/user.php';

if (!empty($_POST) && isset($_POST["username"]) && isset($_POST["password"])) {
    $username = filter_var($_POST["username"]);
    $password = filter_var($_POST["password"]);

    $user = new UserLogin($db);
    if ($username == $user->login($username, $password)) {
        header('Location: index.php');
    } else {
        header('Location: login.php?fail=1');
    }
} else {
    echo file_get_contents("view/login.html");
}
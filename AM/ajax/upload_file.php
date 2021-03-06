<?php
/*
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_DEPRECATED ^ E_NOTICE);*/
foreach ($_POST as $key => $value) {
    ${$key} = $value;
}
foreach ($_GET as $key => $value) {
    ${$key} = $value;
}


require '../lib_php/db.php';

require '../lib_php/user.php';
$user = new UserLogin($db);
$user->confirm_login();


$destiny = getcwd() . "/files/";
$destiny_excel = getcwd() . "/files/excel/";
switch ($action) {

    case "upload":
        $fileName = $_FILES["file"]["name"];
        if (file_exists($destiny . $fileName)) {
            echo $fileName . " Já existe. ";
            return false;
        } else {
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $destiny . $id . "_-_" . $fileName))
                echo json_encode(array("message" => "$fileName Guardado", "id" => $id));
            else
                echo json_encode(array("message" => "$fileName Não Guardado", "id" => $id));
        }
        break;

    case "upload_excel_mkt_codes":
        $file = $_FILES["file"]["name"];

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $destiny_excel . $file)) {


            $docRoot = $_SERVER[DOCUMENT_ROOT];
            $uploadedfile = $file;
            $uploadedfile = preg_replace("/[^-\.\_0-9a-zA-Z]/", "_", $file);
            $ConvertedFile = preg_replace("/\.csv$|\.xls$|\.xlsx$|\.ods$|\.sxc$/i", '.txt', $uploadedfile);

            $file = escapeshellarg($file);
            $ConvertCommand = "mv $docRoot/AM/ajax/files/excel/$file $docRoot/AM/ajax/files/excel/$uploadedfile";

            $a = passthru($ConvertCommand);

            $ConvertCommand = "$docRoot/sips-admin/campaigns/extras/upload/sheet2tab.pl $docRoot/AM/ajax/files/excel/$uploadedfile $docRoot/AM/ajax/files/excel/$ConvertedFile";
            $b = passthru($ConvertCommand);

            $file = fopen("$docRoot/AM/ajax/files/excel/$ConvertedFile", "r");

            $headers = explode("\t", trim(fgets($file, 4096)));

            $array_lines = array();
            while (!feof($file)) {

                $buffer = trim(fgets($file, 4096));

                if (strlen($buffer) > 0) {
                    $buffer = stripslashes($buffer);
                    $buffer = explode("\t", $buffer);
                    $array_lines[] = $buffer;
                }
            }
            $file_name= $_FILES["file"]["name"];
            echo json_encode( array("message" => "$file_name importado com sucesso", data => $array_lines));
            break;
        } else
            echo  json_encode(array("message" => "$file_name Não Importado", data => null));


        break;

    case "upload_report":
        $fileName = $_FILES["file"]["name"];
        if (file_exists($destiny . $fileName)) {
            echo $fileName . " Já existe. ";
        } else {
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $destiny . $fileName))
                echo 1;
            else {
                echo "$fileName não carregado";
            }
        }
        break;

    case "move_files_to_new_folder":
        if (!file_exists($destiny . $new_id . "_encomenda")) {
            mkdir($destiny . $new_id . "_encomenda", 0777, true);
            $srcDir = $destiny;
            $destDir = $destiny . $new_id . "_encomenda";
            if (file_exists($destDir)) {
                if (is_dir($destDir)) {
                    if (is_writable($destDir)) {
                        if ($handle = opendir($srcDir)) {
                            while (false !== ($file = readdir($handle))) {
                                if (is_file($srcDir . '/' . $file)) {
                                    if (strstr($file, $old_id . "_-_")) {
                                        $temp_file = str_replace($old_id . "_-_", "", $file);
                                        rename($srcDir . '/' . $file, $destDir . '/' . $temp_file);
                                    }
                                }
                            }
                            closedir($handle);
                        } else {
                            echo(json_encode("$srcDir não pode ser aberto."));
                        }
                    } else {
                        echo(json_encode("$destDir não permite escrita"));
                    }
                } else {
                    echo(json_encode("$destDir não é um caminho valido!"));
                }
            } else {
                echo(json_encode("$destDir não existe"));
            }
        } else
            echo(json_encode("A pasta escolhida ja existe"));
        echo(json_encode("Pasta de anexos criada"));
        break;

    case "delete":
        if (unlink($destiny . $name))
            echo("ficheiro removido com sucesso");
        else
            echo("Não foi possível remover o ficheiro");
        break;

    case "get_anexos":
        $js = array();
        $dh = @opendir($destiny . $folder);

        while (false !== ($file = readdir($dh))) {
            if ($file != "dummy.gitignore" && $file != ".." && $file != ".")
                $js[] = $file;
        }

        closedir($dh);
        echo json_encode($js);
        break;

    case "get_pdfs":

        $files = array();
        $dh = @opendir($_SERVER['DOCUMENT_ROOT'] . "/AM/CPDF");

        $ref_cliente = preg_replace("/[^0-9]/", "", $ref_cliente);

        while (false !== ($file = readdir($dh))) {
            if ($file == ".." && $file == ".")
                continue;
            $split = explode("_", $file);
            $file_navid = $split[0];
            $split = explode(".", $split[1]);
            $file_ref = $split[0];
            if ($ref_cliente == $file_ref) {
                $files[$file_navid] = $_SERVER['DOCUMENT_ROOT'] . "/AM/CPDF/" . $file;
            }
        }
        closedir($dh);
        ksort($files);

        if (!count($files)) {
            echo json_encode(false);
            break;
        }

        if (is_numeric($navid) && $files[$navid]) {
            echo json_encode(base64_encode(($files[$navid])));
            break;
        } else
            echo json_encode(base64_encode(array_pop($files)));


        break;


}
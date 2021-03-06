<?php

error_reporting(E_ALL ^ E_DEPRECATED ^ E_NOTICE);
ini_set('display_errors', '1');
date_default_timezone_set('Europe/Lisbon');

set_time_limit(1);

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require "$root/AM/lib_php/requests.php";
require "$root/AM/lib_php/db.php";
require "$root/AM/lib_php/calendar.php";
require "$root/AM/lib_php/user.php";
require "$root/AM/lib_php/msg_alerts.php";
require "$root/AM/lib_php/logger.php";
require "$root/AM/lib_php/sendmail.php";
foreach ($_POST as $key => $value) {
    ${$key} = $value;
}
foreach ($_GET as $key => $value) {
    ${$key} = $value;
}

$user = new UserLogin($db);
$user->confirm_login();

$userID = $user->getUser();
$apoio_marketing = new apoio_marketing($db, $userID->user_level, $userID->username, $userID);
$relatorio_correio = new correio($db, $userID->user_level, $userID->username, $userID);
$relatorio_frota = new frota($db, $userID->user_level, $userID->username, $userID);
$relatorio_mensal_stock = new mensal_stock($db, $userID->user_level, $userID->username, $userID);
$relatorio_movimentacao_stock = new movimentacao_stock($db, $userID->user_level, $userID->username, $userID);
$alert = new alerts($db, $userID->username);
$log = new Logger($db, $user->getUser());
switch ($action) {


    //ADDs
    case "criar_relatorio_frota":
        if (!is_array($ocorrencias))
            $ocorrencias = Array();
        $rel_frota=$relatorio_frota->create($data, $matricula, $km, $viatura, $ocorrencias, $comments);
        $log->set($rel_frota[0], Logger::T_INS, Logger::S_FROTA, "",logger::A_SENT);
        echo json_encode($rel_frota);

        break;

    case "criar_relatorio_correio":
        $rel_correio=$relatorio_correio->create($carta_porte, $data, $input_doc_obj_assoc, $comments);
         $log->set($rel_correio[0], Logger::T_INS, Logger::S_MAIL, "",logger::A_SENT);
        echo json_encode($rel_correio);

        break;

    case "criar_apoio_marketing":
        $calendar = new Calendars($db);
        $refs = $calendar->_getRefs($userID->username);
        $system_types = $calendar->getSystemTypes();
        $id = array();
        $start = "";
        $end = "";
        switch ($horario["tipo"]) {
            case "1":
                $start = $horario["inicio1"];
                $end = $horario["fim2"];
                break;
            case "2":
                $start = $horario["inicio1"];
                $end = $horario["inicio2"];
                break;
            case "3":
                $start = $horario["fim1"];
                $end = $horario["fim2"];
                break;
        }

        $apoioID = $apoio_marketing->create($data_inicial, $data_final, $horario, $localidade, $local, $morada, $comments, $local_publicidade);
        $log->set($apoioID, Logger::T_INS, Logger::S_APMKT, "",logger::A_SENT);
        while ($ref = array_pop($refs)) {
            $id[] = $calendar->newReserva($userID->username, "", strtotime($data_inicial . " " . $start), strtotime($data_final . " " . $end), $system_types["Rastreio c/ MKT"], $ref->id, '', $apoioID);
        }

        $msg = "
         <h3>PEDIDO DE APOIO MKT - RASTREIOS</h3>

<strong>Dispenser:</strong>$userID->username
<br>
<br>

<strong>Data de rastreio:</strong>$data_inicial
<br>
<br>

<strong>Horário de rastreio:</strong> " . horario2mail($horario) . "
<br>
<br>

<strong>Localidade:</strong> $localidade
<br>
<br>

<strong>Local de rastreio:</strong> $local
<br>
<br>

<strong>Morada:</strong> $morada
<br>
<br>

<strong>Observações:</strong>
<br>
$comments
<br>
<br>

<table>
    <thead>
        <tr>
            <th width='100' bgcolor='#000000'>
                <p style='color:#fff;margin:0;'>Código Postal</p>
            </th>	
            <th width='450' bgcolor='#000000'>
                <p style='color:#fff;margin:0;'>Freguesia</p>
            </th>	
        </tr>
    </thead>
    <tbody>
    " . postal2tr($local_publicidade) . "
    </tbody>
</table>
<br>

<strong>Submetido por:</strong> $userID->username - $userID->name";

        send_email("marcacao@acusticamedica.pt", "Marketing Acústica Médica", $msg, "PEDIDO DE APOIO MKT - RASTREIOS - $userID->username - $ap->data_inicial");

        echo json_encode($apoio_marketing->setReservation($apoioID, $id));
        break;

    case "criar_relatorio_mensal_stock":
        $rel_ms=($relatorio_mensal_stock->create($data, $produtos));
        $log->set($rel_ms[0], Logger::T_INS, Logger::S_STOCK, "",logger::A_SENT);
        echo json_encode($rel_ms);
        break;

    case "criar_relatorio_movimentacao_stock":
        $rel_mov_s=$relatorio_movimentacao_stock->create($data, $produtos);
        $log->set($rel_mov_s[0], Logger::T_INS, Logger::S_MOVSTOCK, "",logger::A_SENT);
        echo json_encode($rel_mov_s);
        break;


    //Gets to Datatables
    case "get_apoio_marketing_to_datatable":
        echo json_encode($apoio_marketing->get_to_datatable($show_aproved));
        break;

    case "get_relatorio_correio_to_datatable":

        echo json_encode($relatorio_correio->get_to_datatable($show_aproved));
        break;

    case "get_relatorio_frota_to_datatable":
        echo json_encode($relatorio_frota->get_to_datatable($show_aproved));
        break;

    case "get_relatorio_stock_to_datatable":
        echo json_encode($relatorio_mensal_stock->get_to_datatable($show_aproved));
        break;

    case "get_relatorio_movimentacao_to_datatable":
        echo json_encode($relatorio_movimentacao_stock->get_to_datatable($show_aproved));
        break;






    /*

      const S_APMKT = "Apoio Mkt";
      const S_FROTA = "Frota";
      const S_MAIL = "Correio";
      const S_MOVSTOCK = "Mov. Stock";
      const S_STOCK = "Stock"; */


    //Get individuals

    case "get_apoio_mkt":
        echo json_encode($apoio_marketing->get_correio($id));
        break;
    case "get_frota":
        echo json_encode($relatorio_frota->get_anexo_correio($id));
        break;
    case "get_correio":
        echo json_encode($relatorio_correio->get_anexo_correio($id));
        break;
    case "get_mov_stock":
        echo json_encode($relatorio_movimentacao_stock->get_anexo_correio($id));
        break;
    case "get_mensal_stock":
        echo json_encode($relatorio_mensal_stock->get_anexo_correio($id));
        break;


    //Get extras
    case "get_anexo_correio":
        echo json_encode($relatorio_correio->get_anexo_correio($id));
        break;

    case "save_anexo_correio":
        echo json_encode($relatorio_correio->save_anexo_correio($id, $anexos));
        break;

    case "save_stock":
        echo json_encode($relatorio_mensal_stock->save_stock($id, $produtos));
        break;

    case "save_mov_stock":
        echo json_encode($relatorio_movimentacao_stock->save_mov_stock($id, $produtos));
        break;

    case "get_one_mkt";
        echo json_encode($apoio_marketing->get_one($id));
        exit;

    case "set_mkt_report";
        $calendar = new Calendars($db);
        $idRst = $apoio_marketing->get_reservations($id);
        while ($rst = array_pop($idRst)) {
            $calendar->closeMKT($rst);
        }

        $ap = $apoio_marketing->get_one($id);

        $msg = "
<h3>RELATÓRIO DE RASTREIO - APOIO MKT</h3>

    <strong>Localidade:</strong>
<br>
    $ap->local
<br>
<br>
    <strong>Data de Rastreio:</strong>
<br>
    $ap->data_inicial
<br>
<br>
    <strong>Cod. MKT:</strong>
<br>
    $cod
<br>
<br>
    <strong>Dispenser:</strong>
<br>
    $userID->username
<br>
<br>
    <strong>Rastreios efectuados:</strong>
<br>
    $total_rastreios
<br>
<br>
    <strong>Rastreios com perda:</strong>
<br>
    $rastreios_perda
<br>
<br>
    <strong>Vendas (QT):</strong>
<br>
    $vendas
<br>
<br>
    <strong>Valor (€):</strong>
<br>
    $valor
<br>
<br>
    <strong>Observações:</strong>
<br>
    $ap->data_inicial
<br>
<br>
    <strong>Submetido por:</strong> $userID->username - $userID->name";

        send_email("marcacao@acusticamedica.pt", "Marketing Acústica Médica", $msg, "RELATÓRIO DE RASTREIO - APOIO MKT - $userID->username - $ap->data_inicial");
        echo json_encode($apoio_marketing->set_report($id, $cod, $total_rastreios, $rastreios_perda, $vendas, $valor));
        exit;

    case "get_horario_from_apoio_marketing":
        echo json_encode($apoio_marketing->get_horario($id));
        break;

    case "get_locais_publicidade_from_apoio_marketing":
        echo json_encode($apoio_marketing->get_locais_publicidade($id));
        break;

    case "get_ocorrencias_frota":
        echo json_encode($relatorio_frota->get($id));
        break;

    case "get_itens_stock":
        echo json_encode($relatorio_mensal_stock->get($id));
        break;

    case "get_itens_movimentacao":
        echo json_encode($relatorio_movimentacao_stock->get($id));
        break;

    //Accepts Declines

    case "accept_apoio_marketing":
        $result = $apoio_marketing->accept($id);
        if ($result) {
            if ($message)
                $alert->make($result->user, "Apoio Mkt. Aceite  Obs. $message ID:$id", "S_APMKT", $id, 1);
            else
                $alert->update("S_APMKT", $id);
        }
        $log->set($id, Logger::T_UPD, Logger::S_APMKT, json_encode(array("obs" => "Apoio Mkt. Aceite", "msg" => "$message")),logger::A_APV);
        echo json_encode(true);
        break;

    case "decline_apoio_marketing":
        $calendar = new Calendars($db);
        $idRst = $apoio_marketing->get_reservations($id);
        while ($rst = array_pop($idRst)) {
            $calendar->removeReserva($rst);
        }
        $result = $apoio_marketing->decline($id);
        if ($result) {
            if ($message) {
                $message = "Motivo: " . $message;
            }
            $alert->make($result->user, "Apoio Mkt. Recusado $message ID:$id", "S_APMKT", $id, 0);
        }
        $log->set($id, Logger::T_UPD, Logger::S_APMKT, json_encode(array("obs" => "Apoio Mkt. Recusado", "msg" => "$message")),logger::A_DECL);
        echo json_encode(true);
        break;

    case "accept_report_correio":
        $result = $relatorio_correio->accept($id);
        if ($result) {
            if ($message)
                $alert->make($result->user, "Correio Aceite Obs. $message ID:$id", "S_MAIL", $id, 1);
            else
                $alert->update("S_MAIL", $id);
        }
        $log->set($id, Logger::T_UPD, Logger::S_MAIL, json_encode(array("obs" => "Correio Aceite", "msg" => "$message")),logger::A_APV);
        echo json_encode(true);
        break;

    case "decline_report_correio":
        $result = $relatorio_correio->decline($id);

        if ($result) {
            if ($message) {
                $message = "Motivo: " . $message;
            }
            $alert->make($result->user, "Correio Recusado $message ID:$id", "S_MAIL", $id, 0);
        }
        $log->set($id, Logger::T_UPD, Logger::S_MAIL, json_encode(array("obs" => "Correio Recusado", "msg" => "$message")),logger::A_DECL);
        echo json_encode(true);
        break;

    case "accept_report_frota":
        $result = $relatorio_frota->accept($id);
        if ($result) {
            if ($message)
                $alert->make($result->user, "Frota Aceite Obs. $message ID:$id", "S_FROTA", $id, 1);
            else
                $alert->update("S_FROTA", $id);
        }
        $log->set($id, Logger::T_UPD, Logger::S_FROTA, json_encode(array("obs" => "Frota Aceite", "msg" => "$message")),logger::A_APV);
        echo json_encode(true);
        break;

    case "decline_report_frota":
        $result = $relatorio_frota->decline($id);
        if ($result) {
            if ($message) {
                $message = "Motivo: " . $message;
            }
            $alert->make($result->user, "Frota Recusado $message ID:$id", "S_FROTA", $id, 0);
        }
        $log->set($id, Logger::T_UPD, Logger::S_FROTA, json_encode(array("obs" => "Frota Recusado", "msg" => "$message")),logger::A_DECL);
        echo json_encode(true);
        break;

    case "accept_report_stock":
        $result = $relatorio_mensal_stock->accept($id);
        if ($result) {
            if ($message)
                $alert->make($result->user, "Stock Aceite Obs. $message ID:$id", "S_STOCK", $id, 1);
            else
                $alert->update("S_STOCK", $id);
        }
        $log->set($id, Logger::T_UPD, Logger::S_STOCK, json_encode(array("obs" => "Stock Aceite", "msg" => "$message")),logger::A_APV);
        echo json_encode(true);
        break;

    case "decline_report_stock":
        $result = $relatorio_mensal_stock->decline($id);

        if ($result) {
            if (strlen($message))
                $message = "Motivo: " . $message;

            $alert->make($result->user, "Stock Recusado $message ID:$id", "S_STOCK", $id, 0);
        }
        $log->set($id, Logger::T_UPD, Logger::S_STOCK, json_encode(array("obs" => "Stock Recusado", "msg" => "$message")),logger::A_DECL);
        echo json_encode(true);
        break;

    case "accept_report_movimentacao":
        $result = $relatorio_movimentacao_stock->accept($id);
        if ($result) {
            if (strlen($message))
                $alert->make($result->user, "Movimentação stock Aceite Obs. $message ID:$id", "S_MOVSTOCK", $id, 1);
            else
                $alert->update("S_MOVSTOCK", $id);
        }
        $log->set($id, Logger::T_UPD, Logger::S_MOVSTOCK, json_encode(array("obs" => "Movimentação stock Aceite", "msg" => "$message")),logger::A_APV);
        echo json_encode(true);
        break;

    case "decline_report_movimentacao":
        $result = $relatorio_movimentacao_stock->decline($id);

        if ($result) {
            if ($message) {
                $message = "Motivo: " . $message;
            }
            $alert->make($result->user, "Movimentação Recusado: $message ID:$id", "S_MOVSTOCK", $id, 0);
        }
        $log->set($id, Logger::T_UPD, Logger::S_MOVSTOCK, json_encode(array("obs" => "Movimentação stock recusado", "msg" => "$message")),logger::A_DECL);
        echo json_encode(true);
        break;


    //MARKETING CODES - CREATE/EDIT/DELETE/
    case "edit_marketing_code":
        echo json_encode($apoio_marketing->edit_marketing_code($id_codmkt,$new_codmkt, $description));
        break;

    case "create_marketing_code":
        echo json_encode($apoio_marketing->create_marketing_code($codmkt, $description));
        break;

    case "create_multiple_marketing_code":
        echo json_encode($apoio_marketing->create_multiple_marketing_code($codes));
        break;

    case "get_marketing_code_to_datatable":
        echo json_encode($apoio_marketing->get_marketing_code_to_datatable());
        break;

    case "get_marketing_code":
        echo json_encode($apoio_marketing->get_marketing_code($codmkt));
        break;
    case "delete_marketing_code":
        echo json_encode($apoio_marketing->delete_marketing_code($id));
        break;

    default:
        echo 'Are you an hacker? if so, then please come to finesource, where the company parties are full of alcohol and beautifull vanias!';
}

function postal2tr($postal)
{
    $trs = "";
    foreach ($postal as $value) {
        $trs .= "<tr><td>$value[cp]</td><td>$value[freguesia]</td></tr>";
    }
    return $trs;
}

function horario2mail($horario)
{
    switch ($horario[tipo]) {
        case 1:
            return "das $horario[inicio1] às $horario[inicio2] e das $horario[fim1] às $horario[fim2]";
        case 2:
            return "das $horario[inicio1] às $horario[inicio2]";
        case 3:
            return "das $horario[fim1] às $horario[fim2]";
        default:
            break;
    }
}

<?php
require ("../../dbconnect_noutf8.php");
require ("../../functions.php");
header('Content-Encoding: UTF-8');
header('Content-type: text/csv; charset=UTF-8');
echo "\xEF\xBB\xBF";
header('Content-Disposition: attachment; filename=Report_Script_'.date("Y-m-d_H:i:s").'.csv');


if (isset($_GET["query_date"])) {$query_date = $_GET["query_date"];
} elseif (isset($_POST["query_date"])) {$query_date = $_POST["query_date"];
}
if (isset($_GET["end_date"])) {$end_date = $_GET["end_date"];
} elseif (isset($_POST["end_date"])) {$end_date = $_POST["end_date"];
}
if (isset($_GET["campanha"])) {$campanha_id = $_GET["campanha"];
} elseif (isset($_POST["campanha"])) {$campanha_id = $_POST["campanha"];
}
if (isset($_GET["feedback"])) {$feedbacks = $_GET["feedback"];
} elseif (isset($_POST["feedback"])) {$feedbacks = $_POST["feedback"];
}

if($feedbacks[0] != '--TODOS--' AND count($feedbacks)>0){	
	for ($i=0; $i < count($feedbacks); $i++) {
		$array_feedbacks .= (($i != 0) ? "," : "")."'$feedbacks[$i]'";	
	}
	$feedbacks_str = "AND vcs.status IN ($array_feedbacks)";
}else{
	$feedbacks_str = "";
}

//$query_date = date("Y-m-d", strtotime($query_date));
$end_date = date('Y-m-d', strtotime(date("Y-m-d", strtotime($end_date)) . " +1 day"));

$stmt="SELECT Name, Display_name FROM vicidial_list_ref WHERE Campaign_id = '$campanha_id' and active = 1 ORDER BY indice ASC";
$rslt=mysql_query($stmt, $link) or die(mysql_error());
for ($i=0; $i < mysql_num_rows($rslt); $i++) { 
	$row=mysql_fetch_row($rslt);
	$campos .= (($i != 0) ? "," : "")."  A.`$row[0]` as '".mysql_real_escape_string($row[1])."' ";
}

$stmt="SHOW tables LIKE 'custom_$campanha_id';";
$rslt=mysql_query($stmt, $link) or die(mysql_error());
$tem_Script = false;
if (mysql_num_rows($rslt)>0){
	$tem_Script = 1;
	$stmt="SELECT field_label, field_name FROM vicidial_lists_fields WHERE campaign_id = '$campanha_id' AND field_type IN ('AREA', 'SELECT', 'MULTI', 'RADIO', 'CHECKBOX', 'DATE', 'TIME') ORDER BY field_rank ASC";
	$rslt=mysql_query($stmt, $link) or die(mysql_error());
	for ($i=0; $i < mysql_num_rows($rslt); $i++) { 
		$row=mysql_fetch_row($rslt);
		$campos .= ",  B.`$row[0]` as '".mysql_real_escape_string($row[1])."' ";	
	}
}

$script_query = (($tem_Script == 1) ? "LEFT JOIN custom_$campanha_id B ON A.lead_id = B.lead_id" : "");
$stmt="	SELECT 
			C.call_date AS 'Data da Chamada', C.user,
			$campos, 
			vcs.status_name as 'Feedback',C.campaign_id AS 'Linha Entrada', SEC_TO_TIME(C.length_in_sec) as 'Tempo de Chamada', C.queue_position as 'Posicao na Fila', SEC_TO_TIME(C.queue_seconds) as 'Tempo de Queue', C.term_reason as 'Motivo de Hangup'
		FROM vicidial_list A
		INNER JOIN vicidial_closer_log AS C ON C.lead_id=A.lead_id
		$script_query  
		INNER JOIN (SELECT status,status_name,campaign_id FROM vicidial_campaign_statuses UNION ALL SELECT status,status_name,'BANANA' FROM vicidial_statuses) vcs ON vcs.status = C.status 
		WHERE 
			C.call_date BETWEEN '$query_date' AND '$end_date' $feedbacks_str 
		AND (vcs.campaign_id = '$campanha_id' OR vcs.campaign_id = 'BANANA')";
//DEBUG da QUERY final
//echo $stmt;
$rslt=mysql_query($stmt, $link) or die(mysql_error());



$output = fopen('php://output', 'w');
fputcsv($output, $rslt,";",'"');
// output header row (if at least one row exists)
$row = mysql_fetch_assoc($rslt);
if($row) {
	fputcsv($output, array_keys($row),";",'"');
	// reset pointer back to beginning
	mysql_data_seek($rslt, 0);
}


while($row = mysql_fetch_assoc($rslt)) {

	
    fputcsv($output, $row,";",'"');
}
print_r($row);
fclose($output);
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title></title>


<link href="../../../css/style.css" rel="stylesheet" type="text/css" />
<script language="JavaScript" src="../../../calendar/calendar_db.js"></script>
<link rel="stylesheet" href="../../../calendar/calendar.css" />



<?
require('../../../ini/dbconnect.php');
$today = date("Y-m-d");
$query = "	SELECT	campaign_name, 
					campaign_id 
			FROM 	vicidial_campaigns where active = 'Y';";
$query = mysql_query($query, $link);

for ($i=0;$i<mysql_num_rows($query);$i++)
{
	if ($i == 0) 
	{
	$row = mysql_fetch_assoc($query);
	$camp_options .= "<option selected value=$row[campaign_id]>$row[campaign_name]</option>";
	}
	else
	{
	$row = mysql_fetch_assoc($query);
	$camp_options .= "<option value=$row[campaign_id]>$row[campaign_name]</option>";
	}
	
}
?>
</head>
<body>
<form name="totais_db" action="export_csv.php" method="post">
<input type="hidden" value="go" name="resumo_geral_camp">
<div class="cc-mstyle">	
<table>
<tr>
<td id='icon32'><img src='/images/icons/document_inspector_32.png' /></td>
<td id='submenu-title'> Resumo Geral por Campanha  </td>
<td style="text-align:right">Obter Report</td>
<td id='icon32'><input type="image" src='/images/icons/document_export_32.png'/></td>
</tr>
</table>
</div>


<div id="work-area" style="min-height:0px"><br><br>
<div class=cc-mstyle style=border:none>
<table>
<tr>
<td>Dia Inicial:</td>
<td><input style="width:200px; text-align:center;" type="text" name='data_inicial' id='data_inicial' value='<?php echo $today; ?>' /><td>
<script language="JavaScript">
var o_cal = new tcal ({
// form name
'formname': 'totais_db',
// input name 
'controlname': 'data_inicial'
});
o_cal.a_tpl.yearscroll = false;
// o_cal.a_tpl.weekstart = 1; // Monday week start
</script>
</td>
</tr>

<tr>
<td>Dia Final:</td>
<td><input style="width:200px; text-align:center;" type="text" name='data_final' id='data_final' value='<?php echo $today; ?>' /><td>
<script language="JavaScript">
var o_cal = new tcal ({
// form name
'formname': 'totais_db',
// input name 
'controlname': 'data_final'
});
o_cal.a_tpl.yearscroll = false; 
// o_cal.a_tpl.weekstart = 1; // Monday week start
</script>
</td>
</tr>
<tr>
<td>Campanha:</td><td><select name="camp_options[]" multiple="multiple" id="camp_options" style="width:202px; height:150px;"><?php echo $camp_options; ?></select></td>	
</tr>
</table> 
</form>	
<br><br>
</body>
</html>
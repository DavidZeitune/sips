<?php

require("../database/db_connect.php");
foreach ($_POST as $key => $value) {
    ${$key} = $value;
}
foreach ($_GET as $key => $value) {
    ${$key} = $value;
}
ini_set("display_errors", "1");



if ($action == "RollbackEverything") {
    $params0 = array($sent_campaign_id);
    $params1 = array($sent_list_id);

    $db->rawDelete("DELETE FROM vicidial_campaigns WHERE campaign_id IN (?)", $params0);
    $db->rawDelete("DELETE FROM vicidial_campaign_stats WHERE campaign_id IN (?)", $params0);
    $db->rawDelete("DELETE FROM vicidial_campaign_statuses WHERE campaign_id IN (?)", $params0);
    $db->rawDelete("DELETE FROM vicidial_lead_recycle WHERE campaign_id IN (?)", $params0);

    $db->rawDelete("DELETE FROM vicidial_lists WHERE list_id IN (?)", $params1);
    $db->rawDelete("DELETE FROM vicidial_list WHERE list_id IN (?)", $params1);
}




if ($action == "GetPreview") {


    $file = fopen("/tmp/$sent_converted_file", "r");
    
    $buffer = rtrim(fgets($file, 4096)); // headers!
   
    $counter = 0;
    while ($counter < 3) {
        $buffer = rtrim(fgets($file, 4096));
       
        $js['buffer'][] = $buffer;

        $rows = explode("\t", $buffer);
        
        $js[$counter][] = $rows[0];
        $js[$counter][] = utf8_decode($rows[1]);
        $js[$counter][] = utf8_decode($rows[2]);

        $counter++;
    }

    fclose($file);
    echo json_encode($js);
}


if ($action == "CreateCampaign") {
    $result_camps = $db->rawQuery("SELECT count(*) FROM vicidial_campaigns");
    $TempCampaignID = $result_camps[0]['count(*)'];
    while (strlen($TempCampaignID) < 4) {
        $TempCampaignID = "0" . $TempCampaignID;
    }
    $CampaignID = "CT" . $TempCampaignID;
    switch ($lang) {
        case 'pt-male' : $voice = 'Vicente'; break;
        case 'pt-female' : $voice = 'Violeta'; break;
    }
    // ALLOWED CAMPAIGNS
    $params = array($CampaignID);
    $db->rawInsert("INSERT INTO	zero.allowed_campaigns (campaigns) VALUES (?)", $params);


    // CREATE CAMPAIGNS
    $params1 = array($CampaignID, $sent_campaign_name, 'N', 'DOWN', 'Y', '50', '1', 'longest_wait_time', '24hours', '35', '0134', '0', 'ALLFORCE', 'FULLDATE_CUSTPHONE', '0', 'HANGUP', 'RATIO', '3', 'Y', 'DC PU PDROP ERI NA DROP B NEW -', 'Y', 'ALT_AND_ADDR3', $voice);
    $db->rawInsert("INSERT INTO vicidial_campaigns
	(
	campaign_id,
	campaign_name,
	active,
	lead_order,
	allow_closers,
	hopper_level,
	auto_dial_level,
	next_agent_call,
	local_call_time,
	dial_timeout,
	dial_prefix,
	allcalls_delay,
	campaign_recording,
	campaign_rec_filename,
	drop_call_seconds,
	drop_action,
	dial_method,
	adaptive_dropped_percentage,
	no_hopper_leads_logins,
	dial_statuses,
	omit_phone_code,
	auto_alt_dial,
        campaign_description
	)
	VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", $params1);

    // CAMPAING STATS
    $params2 = array($CampaignID);
    $db->rawInsert("INSERT INTO	vicidial_campaign_stats (campaign_id) VALUES (?)", $params2);
    $params3 = array($CampaignID, 'demoij');
    $db->rawInsert("UPDATE vicidial_user_groups SET allowed_campaigns = CONCAT(?, allowed_campaigns) WHERE user_group LIKE ?", $params3);


    // CREATE DBS

    $result1 = $db->rawQuery("SELECT count(*) FROM vicidial_lists");
    $ListID = ($result1[0]['count(*)'] + 50000);

    $params3 = array($ListID, $sent_campaign_name, $CampaignID, 'Y');
    $db->rawInsert("INSERT INTO	vicidial_lists (list_id, list_name, campaign_id, active) VALUES (?, ?, ?, ?)", $params3);

    // RECYCLE

    $params4 = array(array($CampaignID, 'B', 1800, 10, 'Y'),
        array($CampaignID, 'DC', 1800, 10, 'Y'),
        array($CampaignID, 'DROP', 120, 10, 'Y'),
        array($CampaignID, 'ERI', 1800, 10, 'Y'),
        array($CampaignID, 'NA', 3600, 10, 'Y'),
        array($CampaignID, 'PDROP', 120, 10, 'Y'),
        array($CampaignID, 'PU', 120, 10, 'Y')
    );

    for ($i = 0; $i < count($params4); $i++) {
        $db->rawInsert("INSERT INTO	vicidial_lead_recycle (campaign_id, status, attempt_delay, attempt_maximum, active) VALUES (?, ?, ?, ?, ?)", $params4[$i]);
    }

    // STATS

    $params5 = array(array('MSG001', 'Ouviu Mensagem', 'N', $CampaignID, 'Y', 'N'),
        array('MSG002', 'Declinou Mensagem', 'N', $CampaignID, 'Y', 'N'),
        array('MSG003', 'Atendeu e Declinou', 'N', $CampaignID, 'Y', 'N'),
        array('MSG004', 'Ouviu Mensagem e SMS', 'N', $CampaignID, 'Y', 'N'),
        array('MSG005', 'Ouviu Mensagem e EMAIL', 'N', $CampaignID, 'Y', 'N'),
        array('MSG006', 'Tranferência para Call-Center', 'N', $CampaignID, 'Y', 'N'),
        array('MSG007', 'Solicitou Contacto', 'N', $CampaignID, 'Y', 'N')
    );
    for ($i = 0; $i < count($params5); $i++) {
        $db->rawInsert("INSERT INTO	vicidial_campaign_statuses (status, status_name, selectable, campaign_id, human_answered, scheduled_callback) VALUES (?, ?, ?, ?, ?, ?)", $params5[$i]);
    }


    // REMOTE AGENTS

    $result8 = $db->rawQuery("SELECT server_ip FROM servers");
    $ServerIP = $result8[0]['server_ip'];


    for ($i = 0; $i < 10; $i++) {
        $params = array($result_camps[0]['count(*)'] . "00" . $i, 1, $ServerIP, 787778, "INACTIVE", $CampaignID);
        $db->rawInsert("INSERT INTO vicidial_remote_agents (user_start, number_of_lines ,server_ip, conf_exten, status, campaign_id) values(?,?,?,?,?,?)", $params);

        $params = array($result_camps[0]['count(*)'] . "00" . $i, 1234, $CampaignID, "Y");
        $db->rawInsert("INSERT INTO vicidial_users (user, pass, full_name, active) VALUES (?, ?, ?, ?)", $params);
    }






    $js['result'][] = $CampaignID;
    $js['result'][] = $ListID;

    echo json_encode($js);
}

if ($action == "LoadLeads") {
    // REGEX
    $regex_filter = "/['\"`\\;]/";

    // INIS
    $entry_date = date("Y-m-d H:i:s");
    $last_local_call_time = "2008-01-01 00:00:00";
    $gmt_offset = '0';
    $called_since_last_reset = 'N';

    $file = fopen("/tmp/$sent_converted_file", "r");
    $headers = explode("\t", rtrim(fgets($file, 4096)));

    // COUNTERS
    $LineCounter = 0;
    $Errors = 0;
    while (!feof($file)) {
        $buffer = rtrim(fgets($file, 4096));
        if (strlen($buffer) > 0) {
            $buffer = stripslashes($buffer);
            $buffer = explode("\t", $buffer);



            $ErrorCode = 0;

            $PhoneNumber = preg_replace("/[^0-9]/", "", $buffer[0]);
            $PhoneNumberFlag = true;

            $Msg1 = preg_replace("/['\"`\\;]/", "", $buffer[1]);
            $Msg2 = preg_replace("/['\"`\\;]/", "", $buffer[2]);


            if (strlen($PhoneNumber) != 9) {
                $ErrorCode = 1;
                $Errors++;
            } else {
                
            }





            if ($ErrorCode == 0) {
                $params0 = array($PhoneNumber, utf8_decode($Msg1), utf8_decode($Msg2), $entry_date, 'N', 0, "2008-01-01 00:00:00", $sent_list_id, 'NEW');
                $db->rawInsert("INSERT INTO vicidial_list (phone_number, comments, email, entry_date, called_since_last_reset, gmt_offset_now, last_local_call_time, list_id, status ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", $params0);
            } else {
                switch ($ErrorCode) {
                    case 1: $js['errortext'][] = "The phone number ($buffer[0]) in line: " . ($LineCounter + 1) . ", contains errors.";
                }
            }




            $LineCounter++;
        }
    }

    $params = array($LineCounter, $sent_list_id);
    $db->rawUpdate("UPDATE vicidial_lists SET list_description = ? WHERE list_id = ?", $params);


    //$buffer = rtrim(fgets($file, 4096));
    //$buffer = explode("\t", $buffer);
    fclose($file);
    $js['leads'][] = $LineCounter;
    $js['errors'][] = $Errors;

    echo json_encode($js);
}
?>
function MiscOptionsBuilder(Flag)
{
    MiscOptionsElemInit();

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "MiscOptionsBuilder",
                    Flag: Flag,
                    User: User,
                    UserGroup: UserGroup,
                    AllowedCampaigns: AllowedCampaigns,
                    CampaignID: CampaignID
                },
        success: function(data)
        {

            if (Flag === "NEW")
            {

                $("#campaign-name").val(data.new_campaign_name);
                $("#campaign_active_yes").parent().addClass("checked");
                $("#campaign_type_auto").parent().addClass("checked");
                $("#campaign_recording_yes").parent().addClass("checked");
                $("#campaign_lead_order_random").click();
                $("#campaign_atrib_calls").val("Maior Tempo em Espera");
                $("#campaign_callback_type_user").parent().addClass("checked");

                $.each(data.user_groups_id, function(index, value)
                {
                    var Checked;


                    if (data.user_groups_id[index] === UserGroup)
                    {
                        Checked = "checked='checked' disabled='disabled'";
                    }
                    else
                    {
                        Checked = "";
                    }
                    if (((index / 2) % 1) !== 0)
                    {
                        $("#table-groups-2").append("<tr><td width=10px><input class='groups-checkbox' " + Checked + " type='checkbox' value='" + data.user_groups_id[index] + "' name='" + data.user_groups_id[index] + "' id='" + data.user_groups_id[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.user_groups_id[index] + "'>" + data.user_groups_name[index] + "</label></td></tr>");
                    }
                    else
                    {
                        $("#table-groups-1").append("<tr><td width=10px><input class='groups-checkbox' " + Checked + " type='checkbox' value='" + data.user_groups_id[index] + "' name='" + data.user_groups_id[index] + "' id='" + data.user_groups_id[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.user_groups_id[index] + "'>" + data.user_groups_name[index] + "</label></td></tr>");
                    }
                });

                $(".groups-checkbox").uniform();

                CampaignID = data.new_campaign_id;

            }
            else
            {

                var Checked;
                var OddEven;
                $("#campaign-name").val(data.c_name);
                $("#campaign-description").val(data.c_description);
                if (data.c_active === "Y") {
                    $("#campaign_active_yes").parent().addClass("checked");
                } else {
                    $("#campaign_active_no").parent().addClass("checked");
                }
                if (data.c_dial_method === "RATIO") {
                    $("#campaign_type_auto").parent().addClass("checked");
                    $("#ratio-spinner").val(data.c_auto_dial_level);
                    $("#wizard-tabs").tabs("enable", 1);
                } else if (data.c_dial_method === "MANUAL") {
                    $("#campaign_type_manual").parent().addClass("checked");
                    $("#ratio-spinner").spinner("disable");
                    $("#ratio-spinner").val(0);
                    $("#wizard-tabs").tabs("disable", 1);
                } else if (data.c_dial_method === "ADAPT_AVERAGE") {
                    $("#campaign_type_predictive").parent().addClass("checked");
                    $("#ratio-spinner").spinner("disable");
                    $("#ratio-spinner").val(data.c_auto_dial_level);
                    $("#wizard-tabs").tabs("enable", 1);
                }
                
                if(data.c_agent_dial_owner_only==="USER"){
                    $("#campaign-owner-only").parent().addClass("checked");
                }
                
                if (data.c_recording === "ALLFORCE") {
                    $("#campaign_recording_yes").parent().addClass("checked");
                } else {
                    $("#campaign_recording_no").parent().addClass("checked");
                }
                    $("input[name=campaign_lead_order][value='"+data.c_lead_order+"']").prop("checked",true).click();
                if (data.c_next_agent_call === "longest_wait_time") {
                    $("#campaign_atrib_calls").val("Maior Tempo em Espera");
                } else if (data.c_next_agent_call === "random") {
                    $("#campaign_atrib_calls").val("Aleatória");
                } else {
                    $("#campaign_atrib_calls").val("Menos Chamadas Recebidas");
                }
                if (data.c_my_callback_option === "UNCHECKED") {
                    $("#campaign_callback_type_global").parent().addClass("checked");
                } else {
                    $("#campaign_callback_type_user").parent().addClass("checked");
                }
                if (data.c_campaign_allow_inbound === "Y") {
                    $("#campaign-allow-inbound-yes").parent().addClass("checked");
                } else {
                    $("#campaign-allow-inbound-no").parent().addClass("checked");
                }

                if (data.c_agent_display_dialable_leads === "Y") {
                    $("#campaign-show-leads-yes").parent().addClass("checked");
                } else {
                    $("#campaign-show-leads-no").parent().addClass("checked");
                }

                if (data.c_display_queue_count === "Y") {
                    $("#campaign-show-leads-inqueue-count-yes").parent().addClass("checked");
                } else {
                    $("#campaign-show-leads-inqueue-count-no").parent().addClass("checked");
                }
                if (data.c_view_calls_in_queue === "ALL") {
                    $("#campaign-show-leads-inqueue-yes").parent().addClass("checked");
                } else {
                    $("#campaign-show-leads-inqueue-no").parent().addClass("checked");
                }


                if (data.c_agent_lead_search === "ENABLED") {
                    $("#campaign-search-yes").parent().addClass("checked");
                } else {
                    $("#campaign-search-no").parent().addClass("checked");
                }




                if (data.c_agent_allow_transfers === "1") {
                    $("#campaign-transfer-yes").parent().addClass("checked");
                } else {
                    $("#campaign-transfer-no").parent().addClass("checked");
                }

                if (data.c_agent_allow_dtmf === "1") {
                    $("#campaign-dtmf-yes").parent().addClass("checked");
                } else {
                    $("#campaign-dtmf-no").parent().addClass("checked");
                }


                if (data.c_agent_allow_copy_record === "1") {
                    $("#campaign-copy-records-yes").parent().addClass("checked");
                } else {
                    $("#campaign-copy-records-no").parent().addClass("checked");
                }

                $("#campaign_callback_individual_limit").val(data.call_count_target);
                $("#campaign_callback_geral_limit").val(data.callback_hours_block);/////////////////////////////////////////////////

                $.each(data.user_groups_id, function(index, value)
                {
                    Checked = "";
                    $.each(data.selected_user_groups, function(index1, value1)
                    {

                        if (Checked !== "") {
                            return false;
                        }
                        if (value === value1)
                        {
                            if (value === UserGroup)
                            {
                                Checked = "checked='checked' disabled='disabled'";
                            }
                            else
                            {
                                Checked = "checked='checked'";
                            }
                        }
                        else
                        {
                            Checked = "";
                        }

                    });

                    if (((index / 2) % 1) !== 0)
                    {
                        //if( (($("#table-groups-2 tr").length/2) % 1) == 0){ OddEven = " odd-even-table-rows"; } else { OddEven = "";}
                        $("#table-groups-2").append("<tr class='" + OddEven + "'><td width=10px><input class='groups-checkbox' " + Checked + " type='checkbox' value='" + data.user_groups_id[index] + "' name='" + data.user_groups_id[index] + "' id='" + data.user_groups_id[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.user_groups_id[index] + "'>" + data.user_groups_name[index] + "</label></td></tr>");
                    }
                    else
                    {
                        //if( (($("#table-groups-1 tr").length/2) % 1) == 0){ OddEven = " odd-even-table-rows"; } else { OddEven = "";}
                        $("#table-groups-1").append("<tr class='" + OddEven + "'><td width=10px><input class='groups-checkbox' " + Checked + " type='checkbox' value='" + data.user_groups_id[index] + "' name='" + data.user_groups_id[index] + "' id='" + data.user_groups_id[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.user_groups_id[index] + "'>" + data.user_groups_name[index] + "</label></td></tr>");
                    }

                });
                $(".groups-checkbox").uniform();

                CampaignLists = data.campaign_lists;
            }
            $("#main-div").fadeIn(200);
        }
    });

}

function MiscOptionsElemInit()
{
    $("#options-scroll-container").slimScroll({height: '350px', alwaysVisible: "true", size: "5px"});
    $("#btn-config-inbound").button();
    $("#btn-config-dial-status").button();
    $("#btn-check-all-groups").button();
    $("#btn-uncheck-all-groups").button();


    $("#ratio-spinner").spinner({
        min: 1,
        max: 5,
        spin: function(event, ui)
        {
            $.ajax({
                type: "POST",
                url: "_opcoes_gerais-requests.php",
                data:
                        {
                            action: "EditCampaignRatio",
                            CampaignID: CampaignID,
                            Ratio: ui.value
                        },
                success: function(data)
                {
                }
            });
        }
    });

    $("#campaign_callback_individual_limit").spinner({
        min: 0,
        stop: function(event, ui)
        {
            campaignCallbackLimit_individual();
        }
    });

    $("#campaign_callback_geral_limit").spinner({
        min: 0,
        stop: function(event, ui)
        {
            campaignCallbackLimit_geral();
        }
    });

    $.widget("ui.modspinner1", $.ui.spinner,
            {
                options:
                        {
                            min: 1,
                            max: 3
                        },
                _parse: function(value)
                {
                    if (typeof value === "string")
                    {
                        switch (value)
                        {
                            case "Maior Tempo em Espera" :
                                return 1;
                            case "Aleatória" :
                                return 2;
                            case "Menos Chamadas Recebidas":
                                return 3;
                        }
                    }
                    return value;
                },
                _format: function(value)
                {
                    switch (value)
                    {
                        case 1 :
                            return "Maior Tempo em Espera";
                        case 2 :
                            return "Aleatória";
                        case 3 :
                            return "Menos Chamadas Recebidas";
                    }
                }
            });

    $("#campaign_atrib_calls").modspinner1({
        spin: function(event, ui)
        {
            //console.log(ui.value, $(this).attr("aria-valuenow"))
            if (ui.value !== $(this).attr("aria-valuenow") || ~~ui.value === 2)
            {
                $.ajax({
                    type: "POST",
                    url: "_opcoes_gerais-requests.php",
                    data:
                            {
                                action: "EditCallAtrib",
                                CampaignID: CampaignID,
                                Value: ui.value
                            },
                    success: function(data)
                    {
                    }
                });
            }
        }
    });

    $("#dialog-config-dial-status").dialog({
        title: "<table><tr><td><img class='dialog-icon-title' src='icons/mono_wrench_plus_16.png'></td><td><span class='dialog-title'>Configuração de Feedbacks Autorizados</span></td></tr></table> ",
        autoOpen: false,
        height: 580,
        width: 550,
        resizable: false,
        buttons: {"Gravar": DialogConfigDialStatusBtnSave,
            "Fechar": DialogClose
        },
        open: DialogConfigDialStatusOnOpen
    });

    $("#dialog-config-inbound").dialog({
        title: "<table><tr><td><img class='dialog-icon-title' src='icons/mono_wrench_plus_16.png'></td><td><span class='dialog-title'>Configuração de Inbound</span></td></tr></table> ",
        autoOpen: false,
        height: 580,
        width: 550,
        resizable: false,
        buttons: {
            "Fechar": DialogClose
        },
        open: DialogConfigInboundOnOpen
    });
}

function DialogConfigDialStatusOnOpen()
{
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "GetCampaignDialStatuses",
                    CampaignID: CampaignID
                },
        success: function(data)
        {
            $("#table-config-dial-status-1").empty();
            $("#table-config-dial-status-2").empty();
            $.each(data.status, function(index, value)
            {
                var Checked;
                var Disabled;
                var Recycle;
                if (data.selected[index] === 1)
                {
                    Checked = "checked='checked'";
                }
                else
                {
                    Checked = "";
                }
                if (data.status[index] === "ERI" || data.status[index] === "PDROP" || data.status[index] === "DC" || data.status[index] === "PU")
                {
                    Disabled = "disabled='disabled'";
                }
                else
                {
                    Disabled = "";
                }
                if (index === 8)
                {
                    $("#table-config-dial-status-2").append("<tr height='6px'><td></td></tr>");
                    $("#table-config-dial-status-1").append("<tr height='6px'><td></td></tr>");
                }
                if (data.recycle[index] === 1)
                {
                    Recycle = "<img style='opacity:0.6; height:14px; width:14px; margin-top:2px;' title='Em Reciclagem' src='icons/mono_refresh_16.png'>";
                    Disabled = "disabled='disabled'";
                }
                else
                {
                    Recycle = "";
                }
                if (((index / 2) % 1) !== 0)
                {
                    $("#table-config-dial-status-2").append("<tr><td>" + Recycle + "</td><td width=10px><input " + Disabled + " class='checkbox-edit-dial-status' " + Checked + " type='checkbox' value='" + data.status[index] + "' name='" + data.status[index] + "' id='" + data.status[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.status[index] + "'>" + data.status_name[index] + "</label></td></tr>");
                }
                else
                {
                    $("#table-config-dial-status-1").append("<tr><td>" + Recycle + "</td><td width=10px><input " + Disabled + " class='checkbox-edit-dial-status' " + Checked + " type='checkbox' value='" + data.status[index] + "' name='" + data.status[index] + "' id='" + data.status[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.status[index] + "'>" + data.status_name[index] + "</label></td></tr>");
                }

            });
            $(".checkbox-edit-dial-status").uniform();
        }
    });
}

function DialogConfigDialStatusBtnSave()
{
    var EditedDialStatus = new Array();
    $.each($(".checkbox-edit-dial-status"), function()
    {
        if ($(this).parent().hasClass("checked"))
        {
            EditedDialStatus.push($(this).attr("name"));
        }
    });
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "SaveCampaignDialStatus",
                    CampaignID: CampaignID,
                    EditedDialStatus: EditedDialStatus
                },
        success: function(data) {
        }
    });
    $("#dialog-config-dial-status").dialog("close");
}

function DialogConfigInboundBtnSave()
{
}

function DialogConfigInboundOnOpen()
{
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "GetCampaignInboundGroups",
                    CampaignID: CampaignID
                },
        success: function(data)
        {
            $("#table-config-inbound-campaigns-1").empty();
            $("#table-config-inbound-campaigns-2").empty();
            $.each(data.group_id, function(index, value)
            {

                $.each(data.closer_campaigns, function(index1, value1) {

                    if (value1 === data.group_id[index]) {
                        Checked = "checked=checked";
                        return false;
                    }
                    else {
                        Checked = "";

                    }
                });


                if (((index / 2) % 1) !== 0)
                {
                    $("#table-config-inbound-campaigns-2").append("<tr><td width=10px><input " + Checked + " class='checkbox-edit-inbound-groups' type='checkbox' value='" + data.group_id[index] + "' name='" + data.group_id[index] + "' id='" + data.group_id[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.group_id[index] + "'>" + data.group_name[index] + "</label></td></tr>");
                }
                else
                {
                    $("#table-config-inbound-campaigns-1").append("<tr><td width=10px><input " + Checked + " class='checkbox-edit-inbound-groups' type='checkbox' value='" + data.group_id[index] + "' name='" + data.group_id[index] + "' id='" + data.group_id[index] + "'></td><td style='padding-top:1px'><label style='display:inline;' for='" + data.group_id[index] + "'>" + data.group_name[index] + "</label></td></tr>");
                }

            });
            $(".checkbox-edit-inbound-groups").uniform();
        }
    });
}

function GroupsSwitch()
{
    var AddorRemove;
    if ($(this).parent().hasClass("checked"))
    {
        AddorRemove = 1;
    }
    else
    {
        AddorRemove = 0;
    }
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignAllowedGroups",
                    CampaignID: CampaignID,
                    EditedUserGroup: $(this).attr("id"),
                    AddOrRemove: AddorRemove
                }
    });
}

function GroupsCheckAll()
{
    var AllGroups = new Array();
    $.each($(".groups-checkbox"), function(index, value)
    {
        if (!$(this).parent().hasClass("checked"))
        {
            $(this).parent().addClass("checked");
            AllGroups.push($(this).attr("id"));
        }
    });
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignAllowedGroupsALL",
                    CampaignID: CampaignID,
                    AllGroups: AllGroups
                }
    });
}

function GroupsUncheckAll()
{
    var NoGroups = new Array();
    $.each($(".groups-checkbox"), function(index, value)
    {
        if (!$(this).parent().parent().hasClass("disabled"))
        {
            $(this).parent().removeClass("checked");
            NoGroups.push($(this).attr("id"));
        }
    });
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignAllowedGroupsNONE",
                    CampaignID: CampaignID,
                    NoGroups: NoGroups
                },
        success: function(data)
        {
        }
    });

}

function CampaignActiveSwitch()
{
    var CampaignActive;
    if ($(this).attr("id") === 'campaign_active_yes')
    {
        CampaignActive = "Y";
    }
    else
    {
        CampaignActive = "N";
    }
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignActive",
                    CampaignID: CampaignID,
                    CampaignActive: CampaignActive
                }
    });
}

function CampaignTypeSwitch()
{
    var CampaignType;
    var TempCampaignRatio;


    switch ($(this).attr("id")) {
        case "campaign_type_auto" :
            {
                CampaignType = "RATIO";
                TempCampaignRatio = 2;
                $("#ratio-spinner").spinner("enable");
                $("#ratio-spinner").val(2);
                $("#wizard-tabs").tabs("disable", 1);
                break;
            }
        case "campaign_type_manual" :
            {
                CampaignType = "MANUAL";
                TempCampaignRatio = 0;
                $("#ratio-spinner").spinner("disable");
                $("#ratio-spinner").val(0);
                $("#wizard-tabs").tabs("disable", 1);
                break;
            }
        case "campaign_type_predictive" :
            {
                CampaignType = "ADAPT_AVERAGE";
                TempCampaignRatio = 2;
                $("#ratio-spinner").spinner("disable");
                $("#ratio-spinner").val(2);
                $("#wizard-tabs").tabs("enable", 1);

                break;
            }
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignType",
                    CampaignID: CampaignID,
                    CampaignType: CampaignType,
                    TempRatio: TempCampaignRatio
                }
    });

}

function CampaignOwnerOnly(){
      $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignOwnerOnly",
                    CampaignID: CampaignID,
                    CampaignOwnerOnly: ~~$(this).is(":checked")
                }
    });
}


function CampaignRecordingSwitch()
{
    var Recording;
    if ($(this).attr("id") === 'campaign_recording_yes')
    {
        Recording = "ALLFORCE";
    }
    else
    {
        Recording = "NEVER";
    }
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        data:
                {
                    action: "EditCampaignRecording",
                    CampaignID: CampaignID,
                    CampaignRecording: Recording
                }
    });
}

function CampaignLeadOrderSwitch()
{
    var LeadOrder = $(this).val();
    
    $.post("_opcoes_gerais-requests.php",
            {
                action: "EditLeadOrder",
                CampaignID: CampaignID,
                LeadOrder: LeadOrder
            }
    );

}

function EditCampaignName(event)
{
    switch (event.type)
    {
        case "focusin":
            {
                $(this).css("border-color", "#E17009");
                editedCampaignName = $(this).val();
                break;
            }
        case "focusout":
            {
                $(this).css("border-color", "#C0C0C0");
                if (editedCampaignName !== $(this).val())
                {
                    $(".span-active-campaign-name").html($("#campaign-name").val());
                    $.ajax({
                        type: "POST",
                        url: "_opcoes_gerais-requests.php",
                        data:
                                {
                                    action: "EditCampaignName",
                                    CampaignID: CampaignID,
                                    CampaignName: $("#campaign-name").val()
                                }
                    });
                }
                break;
            }
        case "keydown":
            {
                if (event.which === 13) {
                    $(this).blur();
                }
                break;
            }
    }
}

function EditCampaignDescription(event)
{
    switch (event.type)
    {
        case "focusin":
            {
                $(this).css("border-color", "#E17009");
                editedCampaignDescription = $(this).val();
                break;
            }
        case "focusout":
            {
                $(this).css("border-color", "#C0C0C0");
                if (editedCampaignDescription !== $(this).val())
                {
                    $.ajax({
                        type: "POST",
                        url: "_opcoes_gerais-requests.php",
                        data:
                                {
                                    action: "EditCampaignDescription",
                                    CampaignID: CampaignID,
                                    CampaignDescription: $("#campaign-description").val()
                                }
                    });
                }
                break;
            }
    }

}

function CampaignCallbackType()
{
    var Type;
    if ($(this).prop("id") === "campaign_callback_type_user")
    {
        Type = "CHECKED";
    }
    else
    {
        Type = "UNCHECKED";
    }
    $.post("_opcoes_gerais-requests.php", {action: "CampaignCallbackType", CampaignID: CampaignID, Type: Type}, function() {
    }, "json");
}

function InboundSwitch()
{
    var YesNo;
    if ($(this).attr("id") === "campaign_inbound_yes")
    {
        YesNo = "Y";
        $(".div-grupos-inbound").show();
        $(".checkbox-edit-inbound-groups").parent().removeClass("checked");
        $(".checkbox-edit-inbound-groups").removeAttr("checked");
        $(".div-no-groups-inbound").hide();
    }
    else
    {
        YesNo = "N";
        $(".div-grupos-inbound").hide();
        $(".checkbox-edit-inbound-groups").parent().removeClass("checked");
        $(".checkbox-edit-inbound-groups").removeAttr("checked");
        $(".div-no-groups-inbound").show();

    }
    $.uniform.update(".checkbox-edit-inbound-groups");
    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "InboundSwitch",
                    CampaignID: CampaignID,
                    YesNo: YesNo
                },
        success: function(data)
        {
        }
    });
}

function InboundGroupsSwitch()
{
    var Checked;
    if ($(this).parent().hasClass("checked")) {
        Checked = 1;
    }
    else {
        Checked = 0;
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "InboundGroupsSwitch",
                    CampaignID: CampaignID,
                    GroupID: $(this).prop("id"),
                    Checked: Checked
                },
        success: function(data)
        {

        }
    });
}

function CampaignAllowInbound() {
    var Inbound;
    if ($(this).attr("id") === "campaign-allow-inbound-yes") {
        Inbound = "Y";
    }
    else {
        Inbound = "N";
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignAllowInbound",
                    CampaignID: CampaignID,
                    Inbound: Inbound
                },
        success: function(data)
        {

        }
    });
}

function CampaignShowAgentLeads() {
    var Checked;
    if ($(this).attr("id") === "campaign-show-leads-yes") {
        Checked = "Y";
    }
    else {
        Checked = "N";
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignShowAgentLeads",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}

function CampaignShowAgentLeadsCount() {
    var Checked;
    if ($(this).attr("id") === "campaign-show-leads-inqueue-count-yes") {
        Checked = "Y";
    }
    else {
        Checked = "N";
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignShowAgentLeadsCount",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}

function CampaignShowAgentLeadsInqueue() {
    var Checked;
    if ($(this).attr("id") === "campaign-show-leads-inqueue-yes") {
        Checked = "ALL";
    }
    else {
        Checked = "NONE";
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignShowAgentLeadsInqueue",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}

function CampaignAllowAgentSearch() {
    var Checked;
    if ($(this).attr("id") === "campaign-search-yes") {
        Checked = "ENABLED";
    }
    else {
        Checked = "DISABLED";
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignAllowAgentSearch",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}

function CampaignTransfers() {
    var Checked;
    if ($(this).attr("id") === "campaign-transfer-yes") {
        Checked = 1;
    }
    else {
        Checked = 0;
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignTransfers",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}

function CampaignDTMF() {
    var Checked;
    if ($(this).attr("id") === "campaign-dtmf-yes") {
        Checked = 1;
    }
    else {
        Checked = 0;
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignDTMF",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}
function CampaignCopyRecord() {
    var Checked;
    if ($(this).attr("id") === "campaign-copy-records-yes") {
        Checked = 1;
    }
    else {
        Checked = 0;
    }

    $.ajax({
        type: "POST",
        url: "_opcoes_gerais-requests.php",
        dataType: "JSON",
        data:
                {
                    action: "CampaignCopyRecord",
                    CampaignID: CampaignID,
                    Checked: Checked
                }
    });
}




function campaignCallbackLimit_geral()
{
    if (!(isNaN($("#campaign_callback_geral_limit").val())))
    {
        $.ajax({
            type: "POST",
            url: "_opcoes_gerais-requests.php",
            dataType: "JSON",
            data:
                    {
                        action: "CampaignCallbackLimit_geral",
                        CampaignID: CampaignID,
                        max: $("#campaign_callback_geral_limit").val()
                    }
        });
    }
}

function campaignCallbackLimit_individual()
{
    if (!(isNaN($("#campaign_callback_individual_limit").val())))
    {
        $.ajax({
            type: "POST",
            url: "_opcoes_gerais-requests.php",
            dataType: "JSON",
            data:
                    {
                        action: "CampaignCallbackLimit_individual",
                        CampaignID: CampaignID,
                        max: $("#campaign_callback_individual_limit").val()
                    }
        });
    }
}

//campaign_callback_limit

$("body")
        .on("click", ".groups-checkbox", GroupsSwitch)
        .on("click", "#btn-check-all-groups", GroupsCheckAll)
        .on("click", "#btn-uncheck-all-groups", GroupsUncheckAll)
        .on("click", ".campaign-active-switch", CampaignActiveSwitch)
        .on("click", ".campaign-type-switch", CampaignTypeSwitch)
        .on("click", "#campaign-owner-only", CampaignOwnerOnly)
        .on("click", ".campaign-recording-switch", CampaignRecordingSwitch)
        .on("click", "input[name=campaign_lead_order]", CampaignLeadOrderSwitch)
        .on("click", "#btn-config-dial-status", {dialog: "#dialog-config-dial-status"}, DialogOpen)
        .on("focusin focusout keydown", "#campaign-name", EditCampaignName)
        .on("focusin focusout", "#campaign-description", EditCampaignDescription)
        .on("click", ".campaign-callback-type", CampaignCallbackType)
        .on("click", "#btn-config-inbound", {dialog: "#dialog-config-inbound"}, DialogOpen)
        .on("click", ".campaign-inbound-switch", InboundSwitch)
        .on("click", ".checkbox-edit-inbound-groups", InboundGroupsSwitch)
        .on("click", ".campaign-allow-inbound", CampaignAllowInbound)
        .on("click", ".campaign-show-leads", CampaignShowAgentLeads)
        .on("click", ".campaign-show-leads-inqueue-count", CampaignShowAgentLeadsCount)
        .on("click", ".campaign-show-leads-inqueue", CampaignShowAgentLeadsInqueue)
        .on("click", ".campaign-search", CampaignAllowAgentSearch)
        .on("click", ".campaign-transfer", CampaignTransfers)
        .on("click", ".campaign-dtmf", CampaignDTMF)
        .on("click", ".campaign-copy-records", CampaignCopyRecord)
        .on("change", "#campaign_callback_individual_limit", campaignCallbackLimit_individual)
        .on("change", "#campaign_callback_geral_limit", campaignCallbackLimit_geral);
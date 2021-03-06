var temp_value_holder = "";
var current_page_pos = 0;
var selected_id = 0;
var selected_tag = 0;
var selected_type = "";
var array_id = [];
var regex_remove_blank = /^\s*$[\n\r]{1,}/gm;
var regex_replace_textbox_tag = /[^a-zA-Z0-9éÉçÇãÃâÂóÓõÕáÁàÀíÍêÊúÚôÔºª\€\%\_\s:,?\/\-\.\,()@§]/g;
var regex_replace_textbox = /[^a-zA-Z0-9éÉçÇãÃâÂóÓõÕáÁàÀíÍêÊúÚôÔºª\€\%\_\s:,?\/\-\.\,(),]/g;
var regex_replace = /[^a-zA-Z0-9éÉçÇãÃâÂóÓõÕáÁàÀíÍêÊúÚôÔºª\€\%\_\s:,?\/\-\.\,()]/g;
var regex_text = /[^a-zA-Z0-9éÉçÇãÃâÂóÓõÕáÁàÀíÍêÊúÚôÔºª\€\%><=\"\'\_\s\:\-,?\/\-\.\,()@§&]/g;
var regex_split = /\n/g;
var list_ui;
var list_item;

function editor_toggle(tipo) {
    $(".item").removeClass("helperPick");
    $("#tabs").tabs("option", "active", 0);
    if (tipo === "on") {
        $("#edit_div").fadeIn();
        $("#tabs").tabs("enable");
        $("#item_edit_comum").show();
        $("#rule_manager").show();
        $(".editor_layout").hide(); // esconde os edits de todos
        $(".footer_save_cancel button").prop('disabled', false); //botoes de edit
        $("#ipl_file_select option").prop("disabled", false);
    }
    if (tipo === "off") {
        $("#edit_div").hide();
        $("#tabs").tabs("disable", 0);
        $("#tabs").tabs("disable", 1);
        $("#item_edit_comum").hide();
        $("#rule_manager").hide();
        $(".editor_layout").hide();
        $(".footer_save_cancel button").prop('disabled', true);
    }
}

$(function() {
    $('#rule_target_formright').tooltip({
        trigger: "manual"
    });
    $("#rule_creator .form_datetime").datetimepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        language: "pt",
        minView: 2
    });
    //respostas maximas por feedback TEMPORARIO----------------
    $("#max_feedback_div").hide();
    $("#table_max_feedback").hide();
    $("#open_limit_feedback").hide();
    //_:-------------------------
    $(".chosen-select").chosen({
        no_results_text: "Sem resultados"
    });
    array_id["radio"] = 0;
    array_id["checkbox"] = 0;
    array_id["input"] = 0;
    $.get("items/items.html", function(data) {
        $("#rigth_list").html(data);
        $(".rightDiv .item").draggable({
            helper: function(ev, ui) {
                return "<span class='helperPick'>" + $(this).html() + "</span>";
            },
            connectToSortable: ".leftDiv"
        });
        var removeIntent = false;
        $(".leftDiv").sortable({
            'items': ".item",
            over: function() {
                removeIntent = false;
            },
            out: function() {
                removeIntent = true;
            },
            beforeStop: function(event, ui) {
                if (removeIntent) {
                    list_item = $(this).data().uiSortable.currentItem;
                    list_ui = ui;
                    $('#dialog_elements').modal('show');
                }
            },
            update: function(event, ui) {
                var items = $(".leftDiv  .item");
                for (var count = 0; count < items.length; count++) {
                    item_database("edit_item_order", items[count].id, 0, 0, 0, 0, $("#" + items[count].id).index(), 0, 0, 0, 0, 0, 0, 0);
                }
                editor_toggle("off");
            },
            receive: function(event, ui) {
                if ($(this).data().uiSortable.currentItem.hasClass("texto_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "texto", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .texto_class .label_texto")[0].innerHTML, $(".rightDiv .texto_class .input_texto")[0].placeholder, $(".rightDiv .texto_class .input_texto")[0].maxLength, 0, 0, 0, 0, "none");
                }
                if ($(this).data().uiSortable.currentItem.hasClass("pagination_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "pagination", $(this).data().uiSortable.currentItem.index(), "h", 0, 0, 0, [], 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("radio_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "radio", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_radio")[0].innerHTML, 0, 0, ["Valor1"], 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("checkbox_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "checkbox", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_checkbox")[0].innerHTML, 0, 0, ["Valor1"], 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("multichoice_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "multichoice", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_multichoice")[0].innerHTML, 0, 0, ["Opção1"], 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("textfield_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "textfield", $(this).data().uiSortable.currentItem.index(), "h", "textfield", 0, 0, $(".rightDiv .label_textfield")[0].innerHTML, 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("tableradio_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "tableradio", $(this).data().uiSortable.currentItem.index(), "h", "tabela de radios", ["mau", "médio", "bom"], 0, ["pergunta1"], 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("tableinput_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "tableinput", $(this).data().uiSortable.currentItem.index(), "h", "tabela de inputs", ["Manhã", "Tarde", "Noite"], 0, ["Produtos exportados"], 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("legend_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "legend", $(this).data().uiSortable.currentItem.index(), "h", "legend", 0, 0, $(".rightDiv .label_legend")[0].innerHTML, 0, 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("datepicker_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "datepicker", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_datepicker")[0].innerHTML, "2", 0, [], [], 0, 0, 0);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("scheduler_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "scheduler", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_scheduler")[0].innerHTML, 0, 5, [], 0, 0, 0, 1);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("textarea_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "textarea", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_textarea")[0].innerHTML, 0, 0, [], 0, 0, 0, 1);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("ipl_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "ipl", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .label_ipl")[0].innerHTML, 0, 0, [], 0, 0, 0, 3);
                }
                if ($(this).data().uiSortable.currentItem.hasClass("button_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "button", $(this).data().uiSortable.currentItem.index(), "h", $(".rightDiv .botao")[0].innerHTML, 0, 0, [], 0, 0, 0, "");
                }
                if ($(this).data().uiSortable.currentItem.hasClass("validation_class")) {
                    item_database("add_item", 0, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "validation", $(this).data().uiSortable.currentItem.index(), "h", "", 0, 0, [], 0, 0, 0, "");
                }
                editor_toggle("off");
            }
        });
        //Get de todas as campanhas allowed
        $.post("requests.php", {
            action: "get_campaign"
        },
        function(data1) {
            $.each(data1, function() {
                $("#script_campanha_selector").append("<option value=" + this.id + ">" + this.name + "</option>");
            });
            $("#script_campanha_selector").trigger("chosen:updated");
        }, "json");

        $.post("requests.php", {
            action: "get_bd"
        },
        function(data12) {
            $.each(data12, function() {
                if ($("#script_bd_selector optgroup[label='" + this.campaign_name + "']").length) {
                    $("#script_bd_selector optgroup[label='" + this.campaign_name + "']").append("<option data-campaign_id=" + this.campaign_id + " value=" + this.id + " > " + (this.active === "Y" ? "&#10041;  " : "") + this.name + " </option>");
                } else {
                    $("#script_bd_selector").append("<optgroup class='tag_group' data-campaign_id='" + this.campaign_id + "' label='" + this.campaign_name + "'></optgroup>");
                    $("#script_bd_selector optgroup[label='" + this.campaign_name + "']").append("<option data-campaign_id=" + this.campaign_id + " value=" + this.id + " >  " + (this.active === "Y" ? "&#10041;  " : "") + this.name + "</option>");
                }
            });
            $("#script_bd_selector").trigger("chosen:updated");
        }, "json");

        $.post("requests.php", {
            action: "get_linha_inbound"
        },
        function(data11) {
            $.each(data11, function() {
                $("#script_linha_inbound_selector").append("<option value=" + this.id + ">" + this.name + "</option>");
            });
            $("#script_linha_inbound_selector").trigger("chosen:updated");
        }, "json");

        /*$.post("requests.php", {action: "iscloud"},
        function(data2) {
            $(".linha_inbound_div").toggle(data2);
        }, "json");*/
        
        $.post("requests.php", {
            action: "get_schedule"
        },
        function(data3) {
            $.each(data3, function() {
                $("#scheduler_edit_select").append("<option value=" + this.id + ">" + this.text + "</option>");
            });
            $("#scheduler_edit_select").val("").trigger("chosen:updated");
            $("#ipl_file_select").empty();
        }, "json");

        //--------------------------------------//
        editor_toggle("off");
        update_script();
        update_select_ajax();
        update_select();
    });
    $("#edit_div").draggable({
        handle: "a"
    });
    $("#tabs").tabs();
    $("#add_limit_feedback_div").hide();
    $('#textfield_edit').wysiwyg();
    $('#ipl_link').wysiwyg();
    $(document).on("click", ".rule_delete_icon", function(e) {
        rules_database("delete_rule", $(this).data("id"), 0, 0, 0, 0, 0, 0, 0, 0);
    });
});
// ON CLICK DE UM QUALQUER ELEMENTO
$(document).on("click", ".element", function(e) {
    $('html,body').animate({
        scrollTop: $(this).offset().top
    }, 1000);
    $("#edit_div").css("top", $(this).position().top)
            .css("left", $(this).position().left)
            .css("position", "absolute");
    $("#rule_target_select option ").prop('disabled', false).trigger("chosen:updated");
    editor_toggle("on");
    selected_id = $(this).data("id");
    selected_tag = $(this).data("tag");
    selected_type = $(this).data("type");
    $(this).addClass("helperPick"); //class HelperPick
    $("#tabs").tabs("option", "active", 0); //tabs
    switch ($(this).data("type")) {
        case "texto":
            $("#text_layout_editor").show();
            populate_element("texto", $(this));
            break;
        case "radio":
            $("#radio_layout_editor").show();
            populate_element("radio", $(this));
            break;
        case "checkbox":
            $("#checkbox_layout_editor").show();
            populate_element("checkbox", $(this));
            break;
        case "multichoice":
            $("#multichoice_layout_editor").show();
            populate_element("multichoice", $(this));
            break;
        case "textfield":
            $("#textfield_layout_editor").show();
            populate_element("textfield", $(this));
            break;
        case "legend":
            $("#legend_layout_editor").show();
            populate_element("legend", $(this));
            break;
        case "tableradio":
            $("#tableradio_layout_editor").show();
            populate_element("tableradio", $(this));
            break;
        case "tableinput":
            $("#tableinput_layout_editor").show();
            populate_element("tableinput", $(this));
            break;
        case "pagination":
            populate_element("pagination", $(this));
            break;
        case "datepicker":
            var date_limit_element = new date_limit($("#date_limit_placeholder"), $(this).data("limit"));
            date_limit_element.init();
            $("#datepicker_layout_editor").data("data_limit_element", date_limit_element);
            if (date_limit_element.has_limit()) {
                $("#limite_datas_toggle").prop("checked", true);
                $("#date_limit_placeholder").show();
            } else {
                $("#limite_datas_toggle").prop("checked", false);
                $("#date_limit_placeholder").hide();
            }
            $("#datepicker_layout_editor").show();
            populate_element("datepicker", $(this));
            break;
        case "scheduler":
            $("#scheduler_layout_editor").show();
            populate_element("scheduler", $(this));
            break;
        case "textarea":
            $("#textarea_layout_editor").show();
            populate_element("textarea", $(this));
            break;
        case "ipl":

            $("#ipl_layout_editor").show();
            $("#ipl_edit_link").val("");
            populate_element("ipl", $(this));
            break;
        case "button":
            $("#button_layout_editor").show();
            populate_element("button", $(this));
            break;
        case "validation":
            $("#validation_layout_editor").show();
            populate_element("validation", $(this));
            break;
    }
});
//FOOTER EDIT BUTTONS
$(".cancel_edit").click(function() {
    editor_toggle("off");
});
$("#save_edit").click(function() {
    edit_element(selected_type, $("#" + selected_id), 0);
});

$("#tags_select").change(function() {
    $("#tag_label").text("§" + $(this).val() + "§");
});
$("#regra_select").change(function() {
    if ($(this).val() === "goto") {
        $("#go_to_div").show();
        $(".rule_target").hide();
    } else {
        $("#go_to_div").hide();
        $(".rule_target").show();
    }
});
$("#checkbox_scheduler_all").click(function() {
    if (this.checked)
        $("#scheduler_edit_select option").prop("selected", true);
    else
        $("#scheduler_edit_select option").prop("selected", false);
    $("#scheduler_edit_select").trigger("chosen:updated");
});
$("#scheduler_edit_marcação").on("change", function() {
    var option_selected = $("#scheduler_edit_marcação option:selected").val();
    if (option_selected < $("#scheduler_edit_obrigatorio option:selected").val())
        $("#scheduler_edit_obrigatorio").val(option_selected);
    $("#scheduler_edit_obrigatorio option").prop("disabled", false);
    $.each($("#scheduler_edit_obrigatorio option"), function() {
        if ($(this).val() > option_selected)
            $(this).prop("disabled", true);
    });
});
$("#limite_datas_toggle").on("click", function() {
    $("#date_limit_placeholder").fadeToggle(100);
});
$("#alterar_outro_elemento").on("click", function() {
    $("#alterar_outro_elemento_div").fadeToggle(100);
});
$("#apagar_elemento").click(function() {
    item_database("delete_item", list_item.attr("id"), 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), 0, list_item.index(), 0, 0, 0, 0, 0, 0, 0, 0, list_item.data("tag"));
    list_ui.item.remove();
    editor_toggle("off");
    rules_update_targets();
});

$("#button_use_script").click(function() {
    if ($(this).is(":checked")) {
        $("#div_url_input").show();
    } else {
        $("#div_url_input").hide();
    }
});

function update_script(callback) {
    $(".chosen-select").chosen(({
        no_results_text: "Sem resultados"
    }));
    $.post("requests.php", {
        action: "get_scripts"
    },
    function(data) {
        if (!Object.size(data)) {
            $("#page_selector_div button").prop('disabled', true);
            $("#opcao_script_button").prop('disabled', true);
            $("#script_remove_button").prop('disabled', true);
            $("#script_selector").empty();
            $("#page_selector").empty();
            $(".leftDiv").empty();
        } else {
            $("#script_remove_button").prop('disabled', false);
            $("#page_selector_div button").prop('disabled', false);
            $("#opcao_script_button").prop('disabled', false);
            var script = ~~$("#script_selector option:selected").val();
            $("#script_selector").empty();
            $.each(data, function(index, value) {
                if (script === this.id) {
                    $("#script_selector").append("<option value=" + this.id + " selected>" + this.name + "</option>");
                } else
                    $("#script_selector").append("<option value=" + this.id + ">" + this.name + "</option>");
            });
            if (typeof callback === "function")
                callback();
            update_pages();
        }
    }, "json");
}

function update_pages(callback) {
    $.post("requests.php", {
        action: "get_pages",
        id_script: $("#script_selector option:selected").val()
    },
    function(data) {
        if (!Object.size(data)) {
            $("#page_selector").empty();
            $(".leftDiv").hide();
            $("#opcao_page_button").prop('disabled', true);
        } else {
            $(".leftDiv").show();
            $("#opcao_page_button").prop('disabled', false);
            var pag = ~~$("#page_selector option:selected").val();
            $("#page_selector").empty();
            $("#go_to_select").empty();
            $("#page_position").empty();
            $.each(data, function() {
                if (pag === this.id)
                    $("#page_selector").append("<option data-pos=" + this.pos + " value=" + this.id + " selected>" + this.name + "</option>");
                else
                    $("#page_selector").append("<option data-pos=" + this.pos + " value=" + this.id + ">" + this.name + "</option>");
                $("#page_position").append("<option value=" + this.pos + ">" + this.pos + "</option>");
                $("#go_to_select").append(new Option(this.name, this.id));
            });
            if (typeof callback === "function")
                callback();
            update_info();
        }
        //Get das tags dos campos dinâmicos
        $.post("requests.php", {
            action: "get_tag_fields",
            id_script: $("#script_selector option:selected").val()
        },
        function(data4) {
            $("#select_default_value").empty();
            $("#tags_select .tag_group").remove();
            var option = "";
            $("#select_default_value").append("<option value='0' data-campaign_id='0'>Sem Valor por Defeito</option>")
                    .append("<option value='lead_id' data-campaign_id='0'>ID do Cliente</option>")
                    .append("<option value='nome_operador' data-campaign_id='0'>Nome do Operador</option>");
            $.each(data4, function() {
                if ($("#tags_select optgroup[label='" + this.campaign_name + "']").length) {
                    option = "<option data-campaign_id='" + this.campaign_id + "' value='" + this.name + "'>" + this.display_name + "</option>";
                    $("#tags_select optgroup[label='" + this.campaign_name + "']").append(option);
                    $("#select_default_value optgroup[label='" + this.campaign_name + "']").append(option);
                } else {
                    $("#tags_select").append("<optgroup class='tag_group' data-campaign_id='" + this.campaign_id + "' label='" + this.campaign_name + "'></optgroup>");
                    $("#select_default_value").append("<optgroup class='tag_group' data-campaign_id='" + this.campaign_id + "' label='" + this.campaign_name + "'></optgroup>");
                    option = "<option data-campaign_id='" + this.campaign_id + "'  value='" + this.name + "'>" + this.display_name + "</option>";
                    $("#tags_select optgroup[label='" + this.campaign_name + "']").append(option);
                    if (this.name !== "NOME_OPERADOR")
                        $("#select_default_value optgroup[label='" + this.campaign_name + "']").append(option);
                }
            });
            $("#tags_select").trigger("chosen:updated");
            $("#tag_label").text("§" + $("#tags_select option:selected").val() + "§");
        }, "json");
    }, "json");
}

function update_info() {
    $(".leftDiv").empty();
    $.post("requests.php", {
        action: "get_data",
        id_script: $("#script_selector option:selected").val(),
        id_page: $("#page_selector option:selected").val()
    },
    function(data) {
        $.each(data, function(index, value) {
            switch (this.type) {
                case "texto":
                    var item = $('.rightDiv .texto_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "texto")
                            .data("required", this.required)
                            .data("hidden", this.hidden)
                            .data("regex", this.param1)
                            .data("php_script", this.values_text.file)
                            .data("php_script_validado", this.values_text.validado)
                            .data("php_script_not_validado", this.values_text.not_validado)
                            .data("default_value", this.default_value);
                    insert_element("texto", item, this);
                    break;
                case "pagination":
                    var item = $('.rightDiv .pagination_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .data("type", "pagination");
                    insert_element("pagination", item, this);
                    break;
                case "radio":
                    var item = $('.rightDiv .radio_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "radio")
                            .data("required", this.required)
                            .data("hidden", this.hidden)
                            .data("dispo", this.dispo);
                    insert_element("radio", item, this);
                    break;
                case "checkbox":
                    var item = $('.rightDiv .checkbox_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "checkbox")
                            .data("required", this.required)
                            .data("hidden", this.hidden)
                            .data("dispo", this.dispo);
                    insert_element("checkbox", item, this);
                    break;
                case "multichoice":
                    var item = $('.rightDiv .multichoice_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "multichoice")
                            .data("required", this.required)
                            .data("hidden", this.hidden);
                    insert_element("multichoice", item, this);
                    break;
                case "textfield":
                    var item = $('.rightDiv .textfield_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "textfield")
                            .data("required", this.required)
                            .data("hidden", this.hidden);
                    insert_element("textfield", item, this);
                    break;
                case "legend":
                    var item = $('.rightDiv .legend_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "legend")
                            .data("required", this.required)
                            .data("hidden", this.hidden);
                    insert_element("legend", item, this);
                    break;
                case "tableradio":
                    var item = $('.rightDiv .tableradio_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "tableradio")
                            .data("required", this.required)
                            .data("hidden", this.hidden);
                    insert_element("tableradio", item, this);
                    break;
                case "tableinput":
                    var item = $('.rightDiv .tableinput_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "tableinput")
                            .data("required", this.required)
                            .data("hidden", this.hidden);
                    insert_element("tableinput", item, this);
                    break;
                case "datepicker":
                    var item = $('.rightDiv .datepicker_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "datepicker")
                            .data("required", this.required)
                            .data("limit", this.values_text)
                            .data("hidden", this.hidden)
                            .data("only_week_days", this.max_length)
                            .data("alterar_outro_elemento", this.default_value)
                            .data("data_format", this.placeholder);

                    insert_element("datepicker", item, this);
                    break;
                case "scheduler":
                    var item = $('.rightDiv .scheduler_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "scheduler")
                            .data("required", this.required)
                            .data("hidden", this.hidden)
                            .data("max_marc", this.max_length)
                            .data("obrig_marc", this.param1);
                    insert_element("scheduler", item, this);
                    break;
                case "textarea":
                    var item = $('.rightDiv .textarea_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "textarea")
                            .data("required", this.required)
                            .data("hidden", this.hidden);
                    insert_element("textarea", item, this);
                    break;
                case "ipl":
                    var item = $('.rightDiv .ipl_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .data("option", this.param1)
                            .addClass("element")
                            .data("type", "ipl")
                            .data("hidden", this.hidden);
                    insert_element("ipl", item, this);
                    break;
                case "button":
                    var item = $('.rightDiv .button_class').clone();
                    item.appendTo('.leftDiv');
                    item.attr("id", this.id)
                            .data("id", this.id)
                            .data("tag", this.tag)
                            .addClass("element")
                            .data("type", "button")
                            .data("hidden", this.hidden)
                            .data("url", this.values_text)
                            .data("url_elements", this.default_value)
                            .data("validate_onclick", this.required)
                            .data("type_post", this.param1);
                    insert_element("button", item, this);
                    break;
            }
        });
        rules_update_targets();
        $('.tooltip_info').tooltip();
    }, "json");
}


function populate_element(tipo, element) {

    rules_manager(tipo, element);
    $("#tabs").tabs("enable");
    $("#select_default_value").val("");
    if (element.data("required"))
        $("#item_required").attr('checked', true);
    else
        $("#item_required").attr('checked', false);
    if (element.data("hidden"))
        $("#item_hidden").attr('checked', true);
    else
        $("#item_hidden").attr('checked', false);
    $(".required_class").show();
    $("#label_tag").text("@" + element.data("tag") + "@");
    var id = element.data("id");
    switch (tipo) {
        case "texto":
            if ($("#button_ajax_upload_div").hasClass("btn icon-chevron-up"))
                $("#button_ajax_upload_div").trigger("click");
            $("#texto_edit").val($("#" + id + " .label_geral").html());
            $("#placeholder_edit").val($("#" + id + " .input_texto").attr("placeholder"));
            $("#max_length_edit").val($("#" + id + " .input_texto").attr("maxLength"));
            $(".validation input:radio[name='regex_texto'][value=" + element.data("regex") + "]").prop("checked", true);

            if ($("#select_default_value optgroup[data-campaign_id='" + element.data("default_value").campaign_id + "']").length)
                $("#select_default_value optgroup[data-campaign_id='" + element.data("default_value").campaign_id + "'] option[value='" + element.data("default_value").name + "']").prop("selected", true);
            else {
                $("#select_default_value  option[value='" + element.data("default_value").name + "']").prop("selected", true);
            }

            if (~~element.data("php_script") !== 0) {

                $("#select_ajax_script option[value='" + element.data("php_script") + "']").prop("selected", true);
                $("#validado_text").val(element.data("php_script_validado"));
                $("#not_validado_text").val(element.data("php_script_not_validado"));
            } else {
                $("#validado_text").val("");
                $("#not_validado_text").val("");
                $("#select_ajax_script option:first").prop("selected", true);
            }
            break;
        case "radio":
            $("#radio_edit").val($("#" + id + " .label_geral").html());
            var string_elements = "";
            var element_rlength = $("#" + id + " :radio").length;
            var rname;
            for (var count = 0; count < element_rlength; count++) {
                rname = $("#" + id + " .radio_name").eq(count).text();
                if (count === element_rlength - 1)
                    string_elements += rname;
                else
                    string_elements += rname + "\n";
                string_elements = string_elements.replace("<span></span>", "");
            }
            $("#radio_textarea").val(string_elements);
            if (element.data("dispo") === "v")
                $("#vertic_radio").attr('checked', true);
            else
                $("#horiz_radio").attr('checked', true);
            break;
        case "checkbox":
            $("#checkbox_edit").val($("#" + id + " .label_geral").html());
            var string_elements = "";
            var element_clength = $("#" + id + " :checkbox").length;
            var cname;
            for (var count = 0; count < element_clength; count++) {
                cname = $("#" + id + " .checkbox_name").eq(count).text();
                if (count === element_clength - 1)
                    string_elements += cname;
                else
                    string_elements += cname + "\n";
                string_elements = string_elements.replace("<span></span>", "");
            }
            $("#checkbox_textarea").val(string_elements);
            if (element.data("dispo") === "v")
                $("#vertic_checkbox").attr('checked', true);
            else
                $("#horiz_checkbox").attr('checked', true);
            break;
        case "multichoice":
            $("#multichoice_edit").val($("#" + id + " .label_geral").html());
            var string_elements = "";
            var count = 1;
            var max = $("#" + id + " .multichoice_select option").length;
            $("#" + id + " .multichoice_select option").each(function() {
                if (count === max)
                    string_elements += $(this).val();
                else
                    string_elements += $(this).val() + "\n";
                count++;
            });
            $("#multichoice_textarea").val(string_elements);
            break;
        case "textfield":
            $("#tag_edit").hide();
            $("#tabs").tabs("disable", 1);
            $("#rule_manager").hide();

            $(".required_class").hide();
            $("#textfield_edit").html($("#" + id + " .label_geral").html());
            break;
        case "legend":
            $("#legend_edit").val($("#" + id + " .label_geral").html());
            $("#tag_edit").hide();
            $("#tabs").tabs("disable", 1);
            $("#rule_manager").hide();

            $(".required_class").hide();
            break;
        case "tableradio":
            $("#tableradio_edit").val($("#" + id + " .label_geral").html());
            var string_elements = "";
            var head_td = $("#" + id + " .tr_head td");
            for (var count = 1; count < head_td.length; count++) {
                string_elements += head_td[count].innerHTML + "\n";
            }
            $("#tableradio_th_textarea").val(string_elements.slice(0, -1));
            string_elements = "";
            var body_tdrow = $("#" + id + " .tr_body .td_row");
            for (var count = 0; count < body_tdrow.length; count++) {
                string_elements += body_tdrow[count].innerHTML + "\n";
            }
            $("#tableradio_td_textarea").val(string_elements.slice(0, -1));
            break;
        case "tableinput":
            $("#tableinput_edit").val($("#" + id + " .label_geral").html());
            var string_elements = "";
            var head_td = $("#" + id + " .tr_head td");
            for (var count = 1; count < head_td.length; count++) {
                string_elements += head_td[count].innerHTML + "\n";
            }
            $("#tableinput_th_textarea").val(string_elements.slice(0, -1));
            string_elements = "";
            var body_tdrow = $("#" + id + " .tr_body .td_row");
            for (var count = 0; count < body_tdrow.length; count++) {
                string_elements += body_tdrow[count].innerHTML + "\n";
            }
            $("#tableinput_td_textarea").val(string_elements.slice(0, -1));
            break;
        case "datepicker":
            $("#datepicker_edit").val($("#" + id + " .label_geral").html());
            $("#alterar_outro_elemento_select option").prop("disabled", false);
            $("#alterar_outro_elemento_select option[value='" + element.data('tag') + "']").prop("disabled", true);
            $("#datepicker_layout_editor input:radio[name='time_format'][value=" + element.data("data_format") + "]").prop("checked", true);
            if (~~element.data("only_week_days") === 1)
                $("#only_week_days").prop("checked", true);
            else
                $("#only_week_days").prop("checked", false);

            if (~~element.data("alterar_outro_elemento") != 0)
            {
                $("#alterar_outro_elemento").prop("checked", true);
                $("#alterar_outro_elemento_div").show();
                $("#alterar_outro_elemento_select").val(element.data("alterar_outro_elemento")).trigger("chosen:updated");
            }
            else
            {
                $("#alterar_outro_elemento").prop("checked", false);
                $("#alterar_outro_elemento_div").hide();
                $("#alterar_outro_elemento_select").val("").trigger("chosen:updated");
            }

            break;
        case "scheduler":
            $("#tabs").tabs("disable", 1);
            $(".required_class").hide();
            $("#scheduler_edit").val($("#" + id + " .label_geral").html());
            $("#checkbox_scheduler_all").prop("checked", false);
            var select = $("#" + id + " .scheduler_select>option");
            var values = select.map(function() {
                return $(this).val();
            });
            $("#scheduler_edit_select").val(values).trigger("chosen:updated");
            $("#scheduler_edit_marcação").val(element.data("max_marc"));
            $("#scheduler_edit_obrigatorio").val(element.data("obrig_marc"));
            break;
        case "textarea":
            $("#textarea_edit").val($("#" + id + " .label_geral").html());
            break;
        case "ipl":
            $("#tag_edit").hide();
            $("#tabs").tabs("disable", 1);
            $("#rule_manager").hide();

            $(".required_class").hide();
            $("#ipl_edit").val($("#" + id + " .label_geral").html());
            if (~~element.data("option") === 1) {
                $("#radio_ipl_image").prop("checked", true);
                $("#ipl_ip_div").show();
                $("#ipl_link_div").hide();
                $("#ipl_file_select option[value='" + $("#" + id + " .ipl_link").text() + "']").prop("selected", true);
                $("#ipl_file_select option[data-type='pdf']").prop("disabled", true);
            } else if (~~element.data("option") === 2) {
                $("#radio_ipl_pdf").prop("checked", true);
                $("#ipl_ip_div").show();
                $("#ipl_link_div").hide();
                $("#ipl_file_select option[value='" + $("#" + id + " .ipl_link").text() + "']").prop("selected", true);
                $("#ipl_file_select option[data-type='image']").prop("disabled", true);
            } else {
                $("#radio_ipl_link").prop("checked", true);
                $("#ipl_ip_div").hide();
                $("#ipl_link_div").show();
                $("#ipl_edit_link").val($("#" + id + " .ipl_link").text());
            }
            break;
        case "button":
            $("#button_edit").val($("#" + id + " .botao").text());
            $("#button_validate_onclick").prop("checked", element.data("validate_onclick"));
            if (element.data("url").length) {
                $("#div_url_input").show();
                $("#button_use_script").prop("checked", true);
                $("#input_url").val(element.data("url"));
                $("#select_elements_to_url").val(element.data("url_elements")).trigger('chosen:updated');
                if (element.data("type_post") === "POST")
                    $("#type_post").prop("checked", true);
                else
                    $("#type_get").prop("checked", true);
            } else {
                $("#div_url_input").hide();
                $("#button_use_script").prop("checked", false);
                $("#input_url").val("");
                $("#select_elements_to_url").val("").trigger('chosen:updated');
            }
            $(".required_class").hide();
            break;
    }
    rules_database("get_rules_by_trigger", 0, $("#script_selector option:selected").val(), 0, element.data("tag"), 0, 0, 0, 0, 0);
}

function edit_element(opcao, element, data) {
    var id = element.data("id");
    switch (opcao) {
        case "texto":
            if ($("#text_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#texto_edit").val($("#texto_edit").val().replace(regex_replace_textbox_tag, ''));
                $("#placeholder_edit").val($("#placeholder_edit").val().replace(regex_replace_textbox_tag, ''));
                $("#max_length_edit").val($("#max_length_edit").val().replace(/[^0-9]/g, ''));
                $("#" + id + " .label_geral").html($("#texto_edit").val());
                $("#" + id + " .input_texto").attr("placeholder", $("#placeholder_edit").val());
                $("#" + id + " .input_texto").attr("maxLength", $("#max_length_edit").val());
                element.data("regex", $(".validation input:radio[name='regex_texto']:checked").val());
                if ($(".validation input:radio[name='regex_texto']:checked").val() === "ajax") {
                    var ajax_rule = {
                        "file": $("#select_ajax_script option:selected").val(),
                        "validado": $("#validado_text").val(),
                        "not_validado": $("#not_validado_text").val()
                    };
                    item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "texto", element.index(), "h", $("#texto_edit").val(), $("#placeholder_edit").val(), $("#max_length_edit").val(), ajax_rule, {
                        "name": $("#select_default_value option:selected").val(),
                        "campaign_id": $("#select_default_value option:selected").data().campaign_id
                    }, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'), $(".validation input:radio[name='regex_texto']:checked").val());
                    element.data("php_script", $("#select_ajax_script option:selected").val());
                    element.data("php_script_validado", $("#validado_text").val());
                    element.data("php_script_not_validado", $("#not_validado_text").val());
                } else {
                    item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "texto", element.index(), "h", $("#texto_edit").val(), $("#placeholder_edit").val(), $("#max_length_edit").val(), 0, {
                        "name": $("#select_default_value option:selected").val(),
                        "campaign_id": $("#select_default_value option:selected").data().campaign_id
                    }, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'), $(".validation input:radio[name='regex_texto']:checked").val());
                    element.data("php_script", " ");
                    element.data("php_script_validado", "");
                    element.data("php_script_not_validado", "");
                }
                element.data("default_value", {
                    "name": $("#select_default_value option:selected").val(),
                    "campaign_id": $("#select_default_value option:selected").data().campaign_id
                });
            }
            break;
        case "radio":
            if ($("#radio_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                if ($("#vertic_radio").is(':checked'))
                    element.data("dispo", "v");
                else
                    element.data("dispo", "h");
                element.empty();
                $("#radio_edit").val($("#radio_edit").val().replace(regex_replace_textbox_tag, ''));
                element.append($("<label>").addClass("label_radio label_geral").text($("#radio_edit").val()));
                $("#radio_textarea").val($("#radio_textarea").val().replace(regex_replace, ''));
                var radios = $("#radio_textarea").val().split(regex_split);
                for (var i = radios.length - 1; i >= 0; i--) {
                    if (radios[i] === "") {
                        radios.splice(i, 1);
                    }
                }
                for (var count = 0; count < radios.length; count++) {
                    element.append($("<input>")
                            .attr("type", "radio")
                            .attr("id", array_id["radio"] + "radio")
                            .attr("name", element.data("id")))
                            .append($("<label>")
                                    .addClass("radio_name radio inline")
                                    .attr("for", array_id["radio"] + "radio")
                                    .html("<span></span>" + radios[count]));
                    if (element.data("dispo") === "v")
                        element.append($("<br>"));
                    array_id["radio"] = array_id["radio"] + 1;
                }
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "radio", element.index(), element.data("dispo"), $("#radio_edit").val(), 0, 0, radios, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "checkbox":
            if ($("#checkbox_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                if ($("#vertic_checkbox").is(':checked'))
                    element.data("dispo", "v");
                else
                    element.data("dispo", "h");
                element.empty();
                $("#checkbox_edit").val($("#checkbox_edit").val().replace(regex_replace_textbox_tag, ''));
                element.append($("<label>").addClass("label_checkbox label_geral").text($("#checkbox_edit").val()));
                $("#checkbox_textarea").val($("#checkbox_textarea").val().replace(regex_replace, ''));
                var checkboxs = $("#checkbox_textarea").val().split(regex_split);
                for (var i = checkboxs.length - 1; i >= 0; i--) {
                    if (checkboxs[i] === "") {
                        checkboxs.splice(i, 1);
                    }
                }
                for (var count = 0; count < checkboxs.length; count++) {
                    element.append($("<input>")
                            .attr("type", "checkbox")
                            .attr("id", array_id["checkbox"] + "checkbox")
                            .attr("name", element.data("id")))
                            .append($("<label>")
                                    .addClass("checkbox_name checkbox inline")
                                    .attr("for", array_id["checkbox"] + "checkbox")
                                    .html("<span></span>" + checkboxs[count])
                                    );
                    if (element.data("dispo") === "v")
                        element.append($("<br>"));
                    array_id["checkbox"] = array_id["checkbox"] + 1;
                }
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "checkbox", element.index(), element.data("dispo"), $("#checkbox_edit").val(), 0, 0, checkboxs, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "multichoice":
            if ($("#multichoice_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                element.empty();
                $("#multichoice_edit").val($("#multichoice_edit").val().replace(regex_replace_textbox_tag, ''));
                element.append($("<label>").addClass("label_multichoice label_geral").text($("#multichoice_edit").val()));
                $("#multichoice_textarea").val($("#multichoice_textarea").val().replace(regex_replace, ''));
                var multichoices = $("#multichoice_textarea").val().split(regex_split);
                for (var i = multichoices.length - 1; i >= 0; i--) {
                    if (multichoices[i] === "") {
                        multichoices.splice(i, 1);
                    }
                }
                element.append($("<select>").addClass("multichoice_select"));
                var select = $("#" + id + " .multichoice_select");
                for (var count = 0; count < multichoices.length; count++) {
                    select.append("<option value='" + multichoices[count] + "'>" + multichoices[count] + "</option>");
                }
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "multichoice", element.index(), "h", $("#multichoice_edit").val(), 0, 0, multichoices, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "textfield":
            if ($("#textfield_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#textfield_edit").html($("#textfield_edit").html().replace(regex_text, ''));
                $("#" + id + " .label_geral").html($("#textfield_edit").html());
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "textfield", element.index(), "h", "textfield", 0, 0, $("#textfield_edit").html(), 0, false, $("#item_hidden").is(':checked'));
            }
            break;
        case "legend":
            if ($("#legend_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#legend_edit").val($("#legend_edit").val().replace(regex_text, ''));
                $("#" + id + " .label_geral").html($("#legend_edit").val());
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "legend", element.index(), "h", "legend", 0, 0, $("#legend_edit").val(), 0, false, $("#item_hidden").is(':checked'));
            }
            break;
        case "tableradio":
            if ($("#tableradio_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#" + id + " .label_geral").html($("#tableradio_edit").val());
                var tr_head = $("#" + id + " .tr_head");
                tr_head.empty();
                $("#tableradio_th_textarea").val($("#tableradio_th_textarea").val().replace(regex_remove_blank, ""));
                $("#tableradio_th_textarea").val($("#tableradio_th_textarea").val().replace(regex_replace, ''));
                var titulos = $("#tableradio_th_textarea").val().split(regex_split);
                for (var i = titulos.length - 1; i >= 0; i--) {
                    if (titulos[i] === "") {
                        titulos.splice(i, 1);
                    }
                }
                tr_head.append($("<td>"));
                for (var count = 0; count < titulos.length; count++) {
                    tr_head.append($("<td>").text(titulos[count]));
                }
                var tr_body = $("#" + id + " .tr_body");
                tr_body.empty();
                $("#tableradio_td_textarea").val($("#tableradio_td_textarea").val().replace(regex_remove_blank, ""));
                $("#tableradio_td_textarea").val($("#tableradio_td_textarea").val().replace(regex_replace, ''));
                var perguntas = $("#tableradio_td_textarea").val().split(regex_split);
                for (var i = perguntas.length - 1; i >= 0; i--) {
                    if (perguntas[i] === "") {
                        perguntas.splice(i, 1);
                    }
                }
                for (var count = 0; count < perguntas.length; count++) {
                    tr_body.append($("<tr>").append($("<td>").text(perguntas[count]).addClass("td_row")));
                    temp = $("#" + id + " .tr_body tr:last");
                    for (var count2 = 0; count2 < titulos.length; count2++) {
                        temp.append($("<td>")
                                .append($("<input>").attr("type", "radio").attr("id", array_id["radio"]).attr("name", perguntas[count]))
                                .append($("<label>").addClass("radio_name radio inline").attr("for", array_id["radio"]).html("<span></span>")));
                        array_id["radio"] = array_id["radio"] + 1;
                    }
                }
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "tableradio", element.index(), "h", $("#tableradio_edit").val(), titulos, 0, perguntas, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "tableinput":
            if ($("#tableinput_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#" + id + " .label_geral").html($("#tableinput_edit").val());
                var tr_head = $("#" + id + " .tr_head");
                tr_head.empty();
                $("#tableinput_th_textarea").val($("#tableinput_th_textarea").val().replace(regex_remove_blank, ""));
                $("#tableinput_th_textarea").val($("#tableinput_th_textarea").val().replace(regex_replace, ''));
                var titulos = $("#tableinput_th_textarea").val().split(regex_split);
                for (var i = titulos.length - 1; i >= 0; i--) {
                    if (titulos[i] === "") {
                        titulos.splice(i, 1);
                    }
                }
                tr_head.append($("<td>"));
                for (var count = 0; count < titulos.length; count++) {
                    tr_head.append($("<td>").text(titulos[count]));
                }
                var tr_body = $("#" + id + " .tr_body");
                tr_body.empty();
                $("#tableinput_td_textarea").val($("#tableinput_td_textarea").val().replace(regex_remove_blank, ""));
                $("#tableinput_td_textarea").val($("#tableinput_td_textarea").val().replace(regex_replace, ''));
                var perguntas = $("#tableinput_td_textarea").val().split(regex_split);
                for (var i = perguntas.length - 1; i >= 0; i--) {
                    if (perguntas[i] === "") {
                        perguntas.splice(i, 1);
                    }
                }
                for (var count = 0; count < perguntas.length; count++) {
                    tr_body.append($("<tr>").append($("<td>").text(perguntas[count]).addClass("td_row")));
                    temp = $("#" + id + " .tr_body tr:last");
                    for (var count2 = 0; count2 < titulos.length; count2++) {
                        temp.append($("<td>")
                                .append($("<input>").addClass("input-mini").attr("type", "text").attr("id", array_id["input"]).attr("name", perguntas[count]))
                                );
                        array_id["input"] = array_id["input"] + 1;
                    }
                }
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "tableinput", element.index(), "h", $("#tableinput_edit").val(), titulos, 0, perguntas, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "datepicker":
            if ($("#datepicker_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#datepicker_edit").val($("#datepicker_edit").val().replace(regex_replace_textbox_tag, ''));
                $("#" + id + " .label_geral").html($("#datepicker_edit").val());
                var data_format = 0;
                if ($("#time_format_day").is(':checked')) {
                    element.data("data_format", 2);
                    data_format = 2;
                } else if ($("#time_format_day_inverted").is(':checked')) {
                    data_format = 3;
                    element.data("data_format", 3);
                } else if ($("#time_format_hour").is(':checked')) {
                    element.data("data_format", 1);
                    data_format = 1;
                } else if ($("#time_format_minute").is(':checked')) {
                    data_format = 0;
                    element.data("data_format", 0);
                }
                if ($("#only_week_days").is(":checked"))
                    element.data("only_week_days", 1);
                else
                    element.data("only_week_days", 0);

                if ($("#limite_datas_toggle").is(":checked"))
                    element.data("limit", $("#datepicker_layout_editor").data("data_limit_element").get_time());
                else
                    element.data("limit", 0);

                if ($("#alterar_outro_elemento").is(":checked"))
                    element.data("alterar_outro_elemento", $("#alterar_outro_elemento_select").val());
                else
                    element.data("alterar_outro_elemento", []);

                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "datepicker", element.index(), "h", $("#datepicker_edit").val(), data_format, $("#only_week_days").is(":checked") ? 1 : 0, element.data("limit"), element.data("alterar_outro_elemento"), $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "scheduler":
            if ($("#scheduler_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                var options = $("#scheduler_edit_select > option:selected").clone();
                var valores = [];
                $.each(options, function() {
                    valores.push(this.value);
                });
                var select = $("#" + id + " .scheduler_select");
                select.empty();
                select.append("<option value='' selected>Selecione um calendário</option>");
                if (options.length > 0)
                    select.append(options);
                $("#scheduler_edit").val($("#scheduler_edit").val().replace(regex_replace_textbox_tag, ''));
                $("#" + id + " .label_geral").html($("#scheduler_edit").val());
                element.data("max_marc", $("#scheduler_edit_marcação option:selected").val());
                element.data("obrig_marc", $("#scheduler_edit_obrigatorio option:selected").val());
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "scheduler", element.index(), "h", $("#scheduler_edit").val(), "1", $("#scheduler_edit_marcação option:selected").val(), valores, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'), $("#scheduler_edit_obrigatorio option:selected").val());
            }
            break;
        case "textarea":
            if ($("#textarea_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#textarea_edit").val($("#textarea_edit").val().replace(regex_text, ''));
                $("#" + id + " .label_geral").html($("#textarea_edit").val());
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "textarea", element.index(), "h", $("#textarea_edit").val(), 0, 0, 0, 0, $("#item_required").is(':checked'), $("#item_hidden").is(':checked'));
            }
            break;
        case "ipl":
            if ($("#ipl_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#ipl_edit").val($("#ipl_edit").val().replace(regex_text, ''));
                $("#" + id + " .label_geral").html($("#ipl_edit").val());
                if ($("#radio_ipl_image").is(":checked")) {
                    var temp = $("#ipl_file_select option:selected").val();
                    if (temp === "")
                        temp = [];
                    item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "ipl", element.index(), "h", $("#ipl_edit").val(), 0, 0, temp, 0, false, $("#item_hidden").is(':checked'), 1);
                    $("#" + id + " .ipl_link").text($("#ipl_file_select option:selected").val());
                    element.data("option", "1");
                } else if ($("#radio_ipl_pdf").is(":checked")) {
                    var temp = $("#ipl_file_select option:selected").val();
                    if (temp === "")
                        temp = [];
                    item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "ipl", element.index(), "h", $("#ipl_edit").val(), 0, 0, temp, 0, false, $("#item_hidden").is(':checked'), 2);
                    $("#" + id + " .ipl_link").text($("#ipl_file_select option:selected").val());
                    element.data("option", "2");
                } else {
                    var temp = $("#ipl_edit_link").val();
                    if (temp === "")
                        temp = [];
                    item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "ipl", element.index(), "h", $("#ipl_edit").val(), 0, 0, temp, 0, false, $("#item_hidden").is(':checked'), 3);
                    $("#" + id + " .ipl_link").text($("#ipl_edit_link").val());
                    element.data("option", "3");
                }
            }
            break;
        case "button":
            if ($("#button_layout_editor .form_edit_element").validationEngine('validate')) {
                editor_toggle("off");
                $("#button_edit").val($("#button_edit").val().replace(regex_text, ''));
                $("#" + id + " .botao").text($("#button_edit").val());

                if ($("#button_use_script").is(":checked")) {
                    element.data("url", $("#input_url").val())
                            .data("url_elements", $("#select_elements_to_url").val())
                            .data("type_post", $("input[name='type_post']:checked").val());
                } else {
                    element.data("url", "")
                            .data("url_elements", "")
                            .data("type_post", "");
                }
                element.data("validate_onclick", $("#button_validate_onclick").is(":checked"));
                item_database("edit_item", selected_id, 0, $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), "button", element.index(), "h", $("#button_edit").val(), 0, 0, element.data("url"), element.data("url_elements"), $("#button_validate_onclick").is(":checked"), $("#item_hidden").is(':checked'), element.data("type_post"));
            }
            break;
    }

    $("#" + id + " .div_info_item").remove();
    element.prepend($("<div>").css("float", "right").addClass("div_info_item span1"));
    var temp = $("#" + id + " .div_info_item");
    //ids nos elementos
    temp.append($("<label>").addClass("label label-inverse label_id_item").text(element.data("tag")));
    if ($("#item_required").is(':checked')) {
        element.data("required", true);
        temp.append($("<i>").addClass("icon-star required_icon info_icon"));
    } else {
        element.data("required", false);
    }
    if ($("#item_hidden").is(':checked')) {
        element.data("hidden", true);
        temp.append($("<i>").addClass("icon-eye-close hidden_icon info_icon"));
    } else {
        element.data("hidden", false);
        temp.append($("<i>").addClass("icon-eye-open hidden_icon info_icon"));
    }
}

function insert_element(opcao, element, data) {
    element.find(".label_titulo").remove();
    var id = element.data("id");
    switch (opcao) {
        case "texto":
            $("#" + id + " .label_geral").html(data.texto);
            $("#" + id + " .input_texto").attr("placeholder", data.placeholder);
            $("#" + id + " .input_texto").attr("maxLength", data.max_length);
            break;
        case "radio":
            element.empty();
            element.append($("<label>").addClass("label_radio label_geral").text($("#radio_edit").val()));
            $("#" + id + " .label_radio").html(data.texto);
            var radios = data.values_text;
            for (var count = 0; count < radios.length; count++) {
                element.append($("<input>")
                        .attr("type", "radio")
                        .attr("value", count + 1)
                        .attr("id", array_id["radio"] + "radio")
                        .attr("name", data.id))
                        .append($("<label>")
                                .addClass("radio_name radio inline")
                                .attr("for", array_id["radio"] + "radio")
                                .html("<span></span>" + radios[count]));
                if (data.dispo === "v")
                    element.append($("<br>"));
                array_id["radio"] = array_id["radio"] + 1;
            }
            break;
        case "checkbox":
            element.empty();
            element.append($("<label>").addClass("label_checkbox label_geral").text($("#checkbox_edit").val()));
            $("#" + id + " .label_checkbox").html(data.texto);
            var checkboxs = data.values_text;
            for (var count = 0; count < checkboxs.length; count++) {
                element.append($("<input>")
                        .attr("type", "checkbox")
                        .attr("value", count + 1)
                        .attr("id", array_id["checkbox"] + "checkbox")
                        .attr("name", data.id))
                        .append($("<label>")
                                .addClass("checkbox_name checkbox inline")
                                .attr("for", array_id["checkbox"] + "checkbox")
                                .html("<span></span>" + checkboxs[count])
                                );
                if (data.dispo === "v")
                    element.append($("<br>"));
                array_id["checkbox"] = array_id["checkbox"] + 1;
            }
            break;
        case "multichoice":
            element.empty();
            element.append($("<label>").addClass("label_multichoice label_geral").text(data.texto));
            var multichoices = data.values_text;
            element.append($("<select>").addClass("multichoice_select"));
            var select = $("#" + id + " .multichoice_select");
            var options = "";
            for (var count = 0; count < multichoices.length; count++) {
                options += "<option value='" + multichoices[count] + "'>" + multichoices[count] + "</option>";
            }
            select.append(options);
            break;
        case "textfield":
            $("#" + id + " .label_geral").html(data.values_text);
            break;
        case "legend":
            $("#" + id + " .label_geral").html(data.values_text);
            break;
        case "tableradio":
            $("#" + id + " .label_geral").html(data.texto);
            var tr_head = $("#" + id + " .tr_head");
            tr_head.empty();
            var titulos = data.placeholder;
            tr_head.append($("<td>"));
            for (var count = 0; count < titulos.length; count++) {
                tr_head.append($("<td>").text(titulos[count]));
            }
            var tr_body = $("#" + id + " .tr_body");
            tr_body.empty();
            var perguntas = data.values_text;
            var temp = 0;
            for (var count = 0; count < perguntas.length; count++) {
                tr_body.append($("<tr>").append($("<td>").text(perguntas[count]).addClass("td_row")));
                temp = $("#" + id + " .tr_body tr:last");
                for (var count2 = 0; count2 < titulos.length; count2++) {
                    temp.append($("<td>")
                            .append($("<input>")
                                    .attr("type", "radio")
                                    .attr("id", array_id["radio"])
                                    .attr("value", count2 + 1)
                                    .attr("name", data.id + "" + count))

                            .append($("<label>")
                                    .addClass("radio_name radio inline")
                                    .attr("for", array_id["radio"])
                                    .html("<span></span>")
                                    ));
                    array_id["radio"] = array_id["radio"] + 1;
                }
            }
            break;
        case "tableinput":
            $("#" + id + " .label_geral").html(data.texto);
            var tr_head = $("#" + id + " .tr_head");
            tr_head.empty();
            var titulos = data.placeholder;
            tr_head.append($("<td>"));
            for (var count = 0; count < titulos.length; count++) {
                tr_head.append($("<td>").text(titulos[count]));
            }
            var tr_body = $("#" + id + " .tr_body");
            tr_body.empty();
            var perguntas = data.values_text;
            var temp = 0;
            for (var count = 0; count < perguntas.length; count++) {
                tr_body.append($("<tr>").append($("<td>").text(perguntas[count]).addClass("td_row")));
                temp = $("#" + id + " .tr_body tr:last");
                for (var count2 = 0; count2 < titulos.length; count2++) {
                    temp.append($("<td>")
                            .append($("<input>")
                                    .addClass("input-medium")
                                    .attr("type", "text")
                                    .attr("id", array_id["input"])

                                    .attr("name", data.id + "" + count)));
                    array_id["input"] = array_id["input"] + 1;
                }
            }
            break;
        case "datepicker":

            $("#" + id + " .label_geral").html(data.texto);
            break;
        case "scheduler":
            $("#" + id + " .label_geral").html(data.texto);
            var select = $("#" + id + " .scheduler_select");
            var calendarios = data.values_text;
            var options = [];
            $.each(calendarios, function() {
                options.push("<option value='" + this + "'>" + $("#scheduler_edit_select option[value=" + this + "]").text() + "</option>");
            });
            if (options.length > 0)
                select.append(options);
            break;
        case "textarea":
            $("#" + id + " .label_geral").html(data.texto);
            break;
        case "ipl":
            $("#" + id + " .label_geral").html(data.texto);
            $("#" + id + " .ipl_link").html(data.values_text);
            break;
        case "button":
            $("#" + id + " .botao").text(data.texto);
            break;
    }


    element.prepend($("<div>").css("float", "right").addClass("div_info_item span1"));
    var temp = $("#" + id + " .div_info_item");
    //IDs nos elementos 
    temp.append($("<label>").addClass("label label-inverse label_id_item").text(data.tag));
    if (data.required)
        temp.append($("<i>").addClass("icon-star required_icon info_icon"));
    if (opcao !== "pagination") {
        if (data.hidden)
            temp.append($("<i>").addClass("icon-eye-close hidden_icon info_icon"));
        else
            temp.append($("<i>").addClass("icon-eye-open hidden_icon info_icon"));
    }
}


Object.size = function(a) {
    var count = 0;
    var i;
    for (i in a) {
        if (a.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
};



function item_database(opcao, Id, Tag, Id_script, Id_page, Type, Ordem, Dispo, Texto, Placeholder, Max_length, Values_text, Default_value, Required, Hidden, Param1) {

    $.post("requests.php", {
        action: opcao,
        id: Id,
        tag: Tag,
        id_script: Id_script,
        id_page: Id_page,
        type: Type,
        ordem: Ordem,
        dispo: Dispo,
        texto: Texto,
        placeholder: Placeholder,
        max_length: Max_length,
        values_text: Values_text,
        default_value: Default_value,
        required: Required,
        hidden: Hidden,
        param1: Param1
    },
    function(data) {


        if (opcao === "add_item")
            update_info();
    }, "json");
}

function pagescript_database(opcao, Id_script, Id_pagina, Pos) {
    $.post("requests.php", {
        action: opcao,
        id_script: Id_script,
        id_pagina: Id_pagina,
        pos: Pos
    },
    function(data) {
        editor_toggle("off");
        if (opcao === "delete_page") {
            $.jGrowl('Página removida com sucesso', {
                life: 3000
            });
            update_pages();
        }
        if (opcao === "add_script") {
            $.jGrowl('Script adicionado com sucesso', {
                life: 3000
            });
            update_script(function() {
                $("#script_selector option:last-child").prop("selected", true);
            });
        }
        if (opcao === "add_page") {
            $.jGrowl('Página adicionada com sucesso', {
                life: 3000
            });
            update_pages(function() {
                $("#page_selector option:last-child").prop("selected", true);
            });
        }
        if (opcao === "delete_script") {
            $.jGrowl('Script removido com sucesso', {
                life: 3000
            });
            update_script();
        }
    }, "json");
}



//------------------------------------------------------------------------------------------PAGES
$("#page_add_button").click(function() {
    var value1 = 0;
    if ($("#page_selector option").length > 0)
        value1 = $("#page_selector option:last-child").data("pos");
    pagescript_database("add_page", $("#script_selector option:selected").val(), 0, value1 + 1);
});
$("#page_remove_button").click(function() {
    $('#page_modal').modal('show');
});
$("#page_remove_button_modal").click(function() {
    editor_toggle("off");
    pagescript_database("delete_page", $("#script_selector option:selected").val(), $("#page_selector option:selected").val(), $("#page_selector option:selected").data("pos"));
    $('#page_modal').modal('hide');
});
$('#page_selector').change(function() {
    editor_toggle("off");
    update_info();
});
$("#opcao_page_button").click(function() //chama o edit do nome da pagina
{
    current_page_pos = $("#page_selector option:selected").data("pos");
    $("#pages_name_edit").val($("#page_selector option:selected").text());
    $("#page_position option[value=" + $("#page_selector option:selected").data("pos") + "] ").prop("selected", true);
});
$("#save_button_page").click(function() //Fecha o dialog e grava as alterações
{
    $.post("requests.php", {
        action: "edit_page",
        id_script: $("#script_selector option:selected").val(),
        name: $("#pages_name_edit").val(),
        id_pagina: $("#page_selector option:selected").val(),
        old_pos: current_page_pos,
        new_pos: $("#page_position option:selected").val()
    },
    function(data) {

        $('#dialog_page').modal('hide');
        update_pages();
    }, "json");
});
//00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
//-------------------------------------------------------------------------------------SCRIPTS
$("#script_add_button").click(function() {
    pagescript_database("add_script", 0, 0);
});
$("#script_remove_button").click(function() {
    $('#script_modal').modal('show');
});
$("#script_remove_button_modal").click(function() {
    editor_toggle("off");
    pagescript_database("delete_script", $("#script_selector option:selected").val(), 0);
    $('#script_modal').modal('hide');
});
$("#copy_script_button").on("click", function() {
    $('#dialog_layout').modal('hide');
    $.post("requests.php", {
        action: "duplicate_script",
        id_script: $("#script_selector option:selected").val(),
        nome_script: $("#script_selector option:selected").text()
    },
    function(data) {
        update_script();
    }, "json");
});
$('#script_selector').change(function() {

    editor_toggle("off");
    update_pages();
});
$("#opcao_script_button").click(function() //chama o edit do nome do script
{

    $.post("requests.php", {action: "get_camp_linha_by_id_script", id_script: $("#script_selector option:selected").val()},
    function(data) {
        var campaign = [];
        var linha_inbound = [];
        var bd = [];
        $("#script_campanha_selector option").prop("disabled", false);
        $("#script_bd_selector option").prop("disabled", false);
        $("#script_linha_inbound_selector option").prop("disabled", false);
        var this_script = ~~$("#script_selector option:selected").val();

        $.each(data, function(index, value) {

            if (~~this.id_script === this_script) {
                if (this.tipo === "campaign")
                    campaign.push(this.id_camp_linha);
                else if (this.tipo === "linha_inbound")
                    linha_inbound.push(this.id_camp_linha);
                else
                    bd.push(this.id_camp_linha);
            } else {
                if (this.tipo === "campaign")
                    $("#script_campanha_selector option[value='" + this.id_camp_linha + "']").prop("disabled", true);
                else if (this.tipo === "linha_inbound")
                    $("#script_linha_inbound_selector option[value='" + this.id_camp_linha + "']").prop("disabled", true);
                else
                    $("#script_bd_selector option[value='" + this.id_camp_linha + "']").prop("disabled", true);
            }
        });

        $("#script_campanha_selector").val(campaign).trigger("chosen:updated");
        $("#script_linha_inbound_selector").val(linha_inbound).trigger("chosen:updated");
        $("#script_bd_selector").val(bd).trigger("chosen:updated");
    }, "json");
    $("#script_name_edit").val($("#script_selector option:selected").text());
});
$("#save_button_layout").click(function() //Fecha o dialog e grava as alterações
{

    $.post("requests.php", {
        action: "edit_script",
        name: $("#script_name_edit").val(),
        id_script: $("#script_selector option:selected").val(),
        campaign: $("#script_campanha_selector").val(),
        linha_inbound: $("#script_linha_inbound_selector").val(),
        bd: $("#script_bd_selector").val()
    },
    function(data) {
        $('#dialog_layout').modal('hide');
        update_script();
    }, "json");
});
//00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
//-------------------------------------------------------------------------------------RULES
function rules_manager(tipo, element) {
    var rts = $("#rule_trigger_select");
    rts.empty();
    switch (tipo) {
        case "texto":
            rts.append(new Option("Resposta", "answer"));
            rts.append(new Option("Valor especifico", "value_input"));
            break;
        case "radio":
        case "checkbox":
        case "multichoice":
            rts.append(new Option("Valor escolhido", "value_select"));
            break;
        case "tableradio":
            rts.append(new Option("Resposta", "answer"));
            rts.append(new Option("Valor escolhido", "value_select"));
            break;
        case "datepicker":
            rts.append(new Option("Resposta", "answer"));
            rts.append(new Option("Data", "date"));
            break;
        case "textarea":
        case "tableinput":
            rts.append(new Option("Resposta", "answer"));
            break;
        case "button":
            rts.append(new Option("Click", "click"));
            break;
    }

    $("#rule_target_select option[value='" + element.data("tag") + "']").prop('disabled', true).trigger("chosen:updated");
    rts.trigger("change");
}

function rules_update_targets() {
    //Get o tipo e tag de todos os elementos para o select dos alvos (regras)
    $.post("requests.php", {
        action: "get_element_tags",
        id_script: $("#script_selector option:selected").val()
    },
    function(data5) {
        $("#rule_target_select").empty();
        $("#alterar_outro_elemento_select").empty();
        $("#select_elements_to_url").empty();
        var temp_type = "";
        $.each(data5, function(index, value) {
            switch (this.type) {
                case "texto":
                    temp_type = "Caixa de texto";
                    break;
                case "pagination":
                    temp_type = "Paginação";
                    break;
                case "radio":
                    temp_type = "Botão radio";
                    break;
                case "checkbox":
                    temp_type = "Botão resposta multipla";
                    break;
                case "multichoice":
                    temp_type = "Lista de Opções";
                    break;
                case "textfield":
                    temp_type = "Campo de Texto";
                    break;
                case "legend":
                    temp_type = "Titulo";
                    break;
                case "tableradio":
                    temp_type = "Tabela botões radio";
                    break;
                case "datepicker":
                    temp_type = "Seletor tempo e hora";
                    break;
                case "scheduler":
                    temp_type = "Calendário";
                    break;
                case "textarea":
                    temp_type = "Input de texto";
                    break;
                case "ipl":
                    temp_type = "Imagem/PDF/Link";
                case "button":
                    temp_type = "Botão";
                    break;
            }
            $("#rule_target_select").append("<option value=" + this.tag + ">" + this.tag + " --- " + temp_type + "</option>"); //povoar os alvos com as tags e tipos dos elementos
            if (this.type !== "pagination" && this.type !== "textfield" && this.type !== "ipl" && this.type !== "button" && this.type !== "legend")
                $("#select_elements_to_url").append("<option value=" + this.tag + ">" + this.tag + " --- " + temp_type + "</option>");
            if (this.type === "datepicker")
                $("#alterar_outro_elemento_select").append("<option value=" + this.tag + ">" + this.tag + " --- " + temp_type + "</option>");
        });
        $('#rule_target_select').trigger('chosen:updated');
        $("#alterar_outro_elemento_select").trigger('chosen:updated');
        $("#select_elements_to_url").trigger('chosen:updated');
    }, "json");
}

function rules_database(opcao, Id, Id_script, Tipo_elemento, Id_trigger, Id_trigger2, Id_target, Tipo, Param1, Param2) {
    $.post("requests.php", {
        action: opcao,
        id: Id,
        id_script: Id_script,
        tipo_elemento: Tipo_elemento,
        tag_trigger: Id_trigger,
        tag_trigger2: Id_trigger2,
        tag_target: Id_target,
        tipo: Tipo,
        param1: Param1,
        param2: Param2
    },
    function(data) {
        if (opcao === "get_rules_by_trigger") {
            $("#rule_table").hide();
            $("#rule_manager_list").empty();
            $.each(data, function(index, value) {
                switch (this.tipo) {
                    case "show":
                        this.tipo = "mostrar";
                        break;
                    case "hide":
                        this.tipo = "esconder";
                        break;
                    case "goto":
                        this.tipo = "ir para página";
                        break;
                }

                $("#rule_table").show();



                if (this.tipo_elemento === "datepicker") {
                    var temp_text = datepicker_date_decoder(this);
                    $("#rule_manager_list").append($("<tr>")
                            .append($("<td>").text((this.param1 === "date") ? temp_text : "Resposta"))
                            .append($("<td>").text(this.tipo))
                            .append($("<td>").text((this.tipo === "ir para página") ? $("#go_to_select option[value=" + this.tag_target + "]").text() : this.tag_target))
                            .append($("<td>").append($("<button>").addClass("icon-remove rule_delete_icon btn btn-inverse span").data("id", this.id).data("tag_trigger", this.tag_trigger)))
                            );
                } else {

                    if (this.param1 === "answer")
                        this.param1 = "Resposta"; //por questões visuais na tabela
                    if (this.param1 === "click")
                        this.param1 = "Click"; //por questões visuais na tabela

                    $("#rule_manager_list").append($("<tr>")
                            .append($("<td>").text(this.param1 === "value_input" || this.param1 === "value_select" ? this.tag_trigger2 : this.param1))
                            .append($("<td>").text(this.tipo))
                            .append($("<td>").text((this.tipo === "ir para página") ? $("#go_to_select option[value=" + this.tag_target + "]").text() : this.tag_target))
                            .append($("<td>").append($("<button>").addClass("icon-remove rule_delete_icon btn btn-inverse span").data("id", this.id).data("tag_trigger", this.tag_trigger)))
                            );
                }
            });
        }
        if (opcao === "add_rules") {
            rules_database("get_rules_by_trigger", 0, $("#script_selector option:selected").val(), 0, selected_tag, 0, 0, 0, 0, 0);
        }
        if (opcao === "delete_rule") {
            rules_database("get_rules_by_trigger", 0, $("#script_selector option:selected").val(), 0, selected_tag, 0, 0, 0, 0, 0);
        }
    }, "json");
}

$(".date_option_radio").on("click", function() {
    $(".rules_valor_dates").hide();
    if (~~$(this).val() === 1) {
        $("#fixed_date_div1").show();
        if (~~$("#rules_data_select option:selected").val() === 3)
            $("#fixed_date_div2").show();
    } else {
        $("#dinamic_date_div1").show();
        if (~~$("#rules_data_select option:selected").val() === 3)
            $("#dinamic_date_div2").show();
    }

});
$("#rule_trigger_select").change(function() {
    $(".rules_valor_dates").hide();
    $(".rules_valor").hide();
    $("#date_limit_rule_placeholder").hide();
    switch ($("#rule_trigger_select option:selected").val()) {
        case "value_input":
            $("#rules_valor_input_div").show();
            $("#rules_valor_input").val("");
            break;
        case "value_select":
            $("#rules_valor_select_div").show();
            $("#rules_valor_select").empty();
            $.post("requests.php", {
                action: "get_data_individual",
                id: selected_id
            },
            function(data) {
                $('#rules_valor_select').empty();
                var dados = data.values_text;
                if (selected_type === "tableradio") {
                    var titulos = data.placeholder;
                    var options = "";
                    $.each(dados, function(index1, value1) {
                        $.each(titulos, function(index2, value2) {
                            options += "<option value='" + dados[index1] + ";" + titulos[index2] + "'>" + dados[index1] + "---" + titulos[index2] + "</option>";
                        });
                    });
                    $("#rules_valor_select").append(options);
                } else {
                    var options = "";
                    $.each(dados, function(index, value) {
                        options += "<option value='" + this + "'>" + this + "</option>";
                    });
                    $("#rules_valor_select").append(options);
                }
                $('#rules_valor_select').val("").trigger('chosen:updated');
            }, "json");
            break;
        case "date":
            $("#date_limit_rule_placeholder").show();
            var date_limit_element2 = new date_limit($("#date_limit_rule_placeholder"), 0);
            date_limit_element2.init();
            $("#add_rule_button").data("date_limit_element", date_limit_element2);
            break;
    }
});
//Rules safety
$(".values_edit_textarea").on("focus", function() {
    temp_value_holder = $(this).val();
});
$(".values_edit_textarea").on("blur", function() {
    if (temp_value_holder !== $(this).val()) {
        $.post("requests.php", {
            action: "has_rules",
            tag: selected_tag,
            id_script: $("#script_selector option:selected").val()
        },
        function(data) {
            if (~~data !== 0)
                $.jGrowl('Alterou dados que podem ter regras associadas,procure no separador das regras por conflitos/diferença de dados', {
                    life: 6000
                });
        }, "json");
    }
});

$("#add_rule_button").click(function() {
    if ($("#rule_creator .form_edit_element").validationEngine('validate')) {
        if ($("#rule_target_select option:selected").length || $("#regra_select option:selected").val() === "goto") {
            $('#rule_target_formright').tooltip("hide");
            switch (selected_type) {
                case "texto":
                    switch ($("#rule_trigger_select").val()) {
                        case "answer":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#rule_target_select").val(), $("#regra_select").val(), "answer", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#go_to_select").val(), $("#regra_select").val(), "answer", 0);
                            break;
                        case "value_input":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_input").val(), $("#rule_target_select").val(), $("#regra_select").val(), "value_input", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_input").val(), $("#go_to_select").val(), $("#regra_select").val(), "value_input", 0);
                            break;
                    }
                    break;
                case "radio":
                    if ($("#rule_trigger_select").val() === "value_select")
                        if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                            rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#rule_target_select").val(), $("#regra_select").val(), "value_select", "0");
                        else
                            rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#go_to_select").val(), $("#regra_select").val(), "value_select", 0);
                    break;
                case "checkbox":
                    if ($("#rule_trigger_select").val() === "value_select")
                        if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                            rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#rule_target_select").val(), $("#regra_select").val(), "value_select", "0");
                        else
                            rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#go_to_select").val(), $("#regra_select").val(), "value_select", 0);
                    break;
                case "multichoice":
                    if ($("#rule_trigger_select").val() === "value_select")
                        if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                            rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#rule_target_select").val(), $("#regra_select").val(), "value_select", "0");
                        else
                            rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#go_to_select").val(), $("#regra_select").val(), "value_select", 0);
                    break;
                case "tableradio":
                    switch ($("#rule_trigger_select").val()) {
                        case "answer":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#rule_target_select").val(), $("#regra_select").val(), "answer", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#go_to_select").val(), $("#regra_select").val(), "answer", 0);
                            break;
                        case "value_select":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#rule_target_select").val(), $("#regra_select").val(), "value_select", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, $("#rules_valor_select").val(), $("#go_to_select").val(), $("#regra_select").val(), "value_select", 0);
                            break;
                    }

                case "tableinput":
                    switch ($("#rule_trigger_select").val()) {
                        case "answer":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#rule_target_select").val(), $("#regra_select").val(), "answer", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#go_to_select").val(), $("#regra_select").val(), "answer", 0);
                            break;
                    }
                    break;
                case "datepicker":
                    switch ($("#rule_trigger_select").val()) {
                        case "answer":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#rule_target_select").val(), $("#regra_select").val(), "answer", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#go_to_select").val(), $("#regra_select").val(), "answer", 0);
                            break;
                        case "date":


                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#rule_target_select").val(), $("#regra_select").val(), "date", $("#add_rule_button").data("date_limit_element").get_time());
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#go_to_select").val(), $("#regra_select").val(), "date", $("#add_rule_button").data("date_limit_element").get_time());
                            break;
                    }
                    break;
                case "textarea":
                    switch ($("#rule_trigger_select").val()) {
                        case "answer":
                            if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#rule_target_select").val(), $("#regra_select").val(), "answer", "0");
                            else
                                rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "answer", $("#go_to_select").val(), $("#regra_select").val(), "answer", 0);
                            break;
                    }
                    break;
                case "button":

                    if ($("#regra_select").val() === "show" || $("#regra_select").val() === "hide")
                        rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "click", $("#rule_target_select").val(), $("#regra_select").val(), "click", 0);
                    else
                        rules_database("add_rules", 0, $("#script_selector option:selected").val(), selected_type, selected_tag, "click", $("#go_to_select").val(), $("#regra_select").val(), "click", 0);


            }
            $("#rule_target_select").val("").trigger("chosen:updated");
            $("#rules_valor_select").val("").trigger("chosen:updated");

        } else {
            $('#rule_target_formright').tooltip("show");
        }

    }

});
$("#rule_form").on("submit", function(e) {
    e.preventDefault();
});
//00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

//------------------------RENDER/FULLSCREEN 
$("#render_go").click(function() {
    var window_slave = window.open("/sips-admin/script_dinamico/fullscreen.html?script_id=" + $("#script_selector option:selected").val());
});
//-------------------------------------------------------------------------AJAX UPLOAD
$('#ajax_upload_input').change(function() {
    var re_ext = new RegExp("(php)", "i");
    var file = this.files[0];
    var name = file.name;
    var size = (Math.round((file.size / 1024 / 1024) * 100) / 100);
    var type = name.substr(name.lastIndexOf('.') + 1);
    if (size > 10) {
        $("#ajax_upload_span").text("O tamanho do ficheiro ultrapassa os 10mb permitidos.");
        $(this).fileupload('clear');
    }


    if (!re_ext.test(type)) {
        $("#ajax_upload_span").text("A extensão do ficheiro seleccionado não é valida.");
        $(this).fileupload('clear');
    }
    $("#ajax_upload_span").text("");
});
$("#ajax_upload_button").on("click", function(e) {
    e.preventDefault();
    var form = $("#ajax_upload_form");
    if (form.find('input[type="file"]').val() === '')
        return false;
    var formData = new FormData(form[0]);
    formData.append("action", "upload_php");
    $("#validado_text").val("");
    $("#not_validado_text").val("");
    $.ajax({
        url: 'upload.php',
        type: 'POST',
        data: formData,
        dataType: "json",
        cache: false,
        action: "upload_php",
        complete: function(data) {
            $("#ajax_upload_span").text(data.responseText);
            update_select_ajax();
        },
        contentType: false,
        processData: false
    });
});

function update_select_ajax() {
    $.post("requests.php", {
        action: "get_php_ajax"
    },
    function(data) {
        $("#select_ajax_script").empty();
        $.each(data, function() {
            $("#select_ajax_script").append("<option value=" + this + ">" + this + "</option>");
        });
    }, "json");
}
;
$("#select_ajax_script").on("change", function() {
    $("#validado_text").val("");
    $("#not_validado_text").val("");
});
$("#remove_uploaded_file_ajax").on("click", function() {

    $.post("upload.php", {
        action: "delete",
        name: $("#select_ajax_script option:selected").val()
    }, function(data) {
        $("#ajax_upload_span").text(data);
        update_select_ajax();
    });
});
$("#button_ajax_upload_div").on("click", function(e) {
    e.preventDefault();
    $("#div_ajax_upload").slideToggle(500);
    $(this).toggleClass("icon-chevron-up");
    $(this).toggleClass("icon-chevron-down");
});
//000000000000000000000000000000000000000000000000000000000000000000000000000000000000
//------------------------------------------------------------------------FILE UPLOADS
$(".ipl_radio_options").on("click", function() {

    $("#ipl_link_div").hide();
    $("#ipl_ip_div").show();
    $("#ipl_file_select option").prop("disabled", false);
    if (this.value === "1") {
        $("#ipl_file_select option[data-type='pdf']").prop("disabled", true);
    } else if (this.value === "2") {
        $("#ipl_file_select option[data-type='image']").prop("disabled", true);
    } else {
        $("#ipl_ip_div").hide();
        $("#ipl_link_div").show();
    }
    $("#ipl_file_select").val("");
});
$('#file_upload').change(function() {
    var re_ext = new RegExp("(gif|jpeg|jpg|png|pdf)", "i");
    var file = this.files[0];
    var name = file.name;
    var size = (Math.round((file.size / 1024 / 1024) * 100) / 100);
    var type = file.type;
    if (size > 10) {
        $("#label_ipl_info").text("O tamanho do ficheiro ultrapassa os 10mb permitidos.");
        $(this).fileupload('clear');
    }
    if (!re_ext.test(type)) {
        $("#label_ipl_info").text("A extensão do ficheiro seleccionado não é valida.");
        $(this).fileupload('clear');
    }
    $("#label_ipl_info").text("");
});
$("#ipl_upload_button").on("click", function(e) {
    e.preventDefault();
    var form = $("#form_ipl");
    if (form.find('input[type="file"]').val() === '')
        return false;
    var formData = new FormData(form[0]);
    formData.append("action", "upload");
    $.ajax({
        url: 'upload.php',
        type: 'POST',
        data: formData,
        dataType: "json",
        cache: false,
        complete: function(data) {

            $("#label_ipl_info").text(data.responseText);
            $("#ipl_file_select").empty();
            update_select();
        },
        contentType: false,
        processData: false
    });
});

function update_select() {
    $.post("requests.php", {
        action: "get_image_pdf"
    },
    function(data) {
        $("#ipl_file_select").empty();
        $.each(data, function() {
            $("#ipl_file_select").append("<option data-type=" + this.type + " value=" + this.value + ">" + this.value + "</option>");
        });
        if ($("#radio_ipl_image").is(":checked"))
            $("#ipl_file_select option[data-type='pdf']").prop("disabled", true);
        if ($("#radio_ipl_pdf").is(":checked"))
            $("#ipl_file_select option[data-type='image']").prop("disabled", true);
    }, "json");
}
$("#remove_uploaded_file").on("click", function() {
    $("#remove_upload_file_modal").modal("show");
    $("#remove_upload_file_modal").find(".modal-body").empty().append($("<p>").text("Tem a certeza que deseja eliminar o ficheiro " + $("#ipl_file_select:selected").text()));
});
$("#remove_uploaded_file_modal").on("click", function() {
    $.post("upload.php", {
        action: "delete",
        name: $("#ipl_file_select option:selected").val()
    }, function(data) {
        $("#remove_upload_file_modal").modal("hide");
        $("#label_ipl_info").text(data);
        update_select();
    });

});
//00000000000000000000000000000000000000000000000000000000000000000000000000000000000

//--------------------------------------------------------------------------Extra Functions
function datepicker_date_decoder(info) {
    var temp_text = "";
    if (info.param2.type === "fixed") {
        if (info.param2.data_inicial && info.param2.data_final)
            temp_text = "data fixa de " + info.param2.data_inicial + " a " + info.param2.data_final;
        else if (info.param2.data_inicial)
            temp_text = "data fixa a partir de " + info.param2.data_inicial;
        else
            temp_text = "data fixa até " + info.param2.data_final;

    } else {

        var data_inicial;
        var data_inicial_text = "";
        var data_final;
        var data_final_text = "";
        if (info.param2.data_inicial) {
            data_inicial = info.param2.data_inicial.split("|");
            if (data_inicial[0] !== "#")
                if (data_inicial[0] !== 1 && data_inicial[0] !== -1)
                    data_inicial_text = data_inicial[0] + " Anos ";
                else
                    data_inicial_text = data_inicial[0] + " Ano ";
            if (data_inicial[1] !== "#")
                if (data_inicial[1] !== 1 && data_inicial[1] !== -1)
                    data_inicial_text = data_inicial_text + data_inicial[1] + " Meses ";
                else
                    data_inicial_text = data_inicial_text + data_inicial[1] + " Mês ";
            if (data_inicial[2] !== "#")
                if (data_inicial[2] !== 1 && data_inicial[2] !== -1)
                    data_inicial_text = data_inicial_text + data_inicial[2] + " Dias ";
                else
                    data_inicial_text = data_inicial_text + data_inicial[2] + " Dia ";
            if (data_inicial[3] !== "#")
                if (data_inicial[3] !== 1 && data_inicial[3] !== -1)
                    data_inicial_text = data_inicial_text + data_inicial[3] + " Horas ";
                else
                    data_inicial_text = data_inicial_text + data_inicial[3] + " Hora ";


        }
        if (info.param2.data_final) {
            data_final = info.param2.data_final.split("|");
            if (data_final[0] !== "#")
                if (data_final[0] !== 1 && data_final[0] !== -1)
                    data_final_text = data_final[0] + " Anos ";
                else
                    data_final_text = data_final[0] + " Ano ";
            if (data_final[1] !== "#")
                if (data_final[1] !== 1 && data_final[1] !== -1)
                    data_final_text = data_final_text + data_final[1] + " Meses ";
                else
                    data_final_text = data_final_text + data_final[1] + " Mês ";
            if (data_final[2] !== "#")
                if (data_final[2] !== 1 && data_final[2] !== -1)
                    data_final_text = data_final_text + data_final[2] + " Dias ";
                else
                    data_final_text = data_final_text + data_final[2] + " Dia ";
            if (data_final[3] !== "#")
                if (data_final[3] !== 1 && data_final[3] !== -1)
                    data_final_text = data_final_text + data_final[3] + " Horas ";
                else
                    data_final_text = data_final_text + data_final[3] + " Hora ";
        }
        if (data_inicial_text && data_final_text)
            temp_text = "data dinamica de " + data_inicial_text + " até " + data_final_text;
        else if (data_inicial_text)
            temp_text = "data dinamica a partir de " + data_inicial_text;
        else
            temp_text = "data dinamica até " + data_final_text;


    }
    return temp_text;
}
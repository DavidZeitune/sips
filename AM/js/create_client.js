$(function () {

    $.msg();
    $('#form_create_client').stepy(
        {
            backLabel: "Anterior",
            nextLabel: "Seguinte",
            next: function () {
                return ($(this).validationEngine("validate"));
            },
            finishButton: false
        });

    $("#verif_client_data").validationEngine();
    $.post("ajax/create_client.php", {action: "get_fields"},
        function (data) {
            $("#inputs_div1,#inputs_div2,#inputs_div3").empty();
            var input,
                custom_class = "",
                input1 = $("#inputs_div1"),
                input2 = $("#inputs_div2"),
                input3 = $("#inputs_div3"),
                elmt,
                specialE,
                hide = "";
            $.each(data, function () {

                if (this.name === "extra5") {
                    elmt = $("<select>", {id: this.name, name: this.name});
                    var optionsRaw = ["", "ADM (ADME/ADMA/ADMFA)", "ADSE", "APL", "CGD", "Centro Nac. de Protecção Contra Riscos Profissionais", "EDP", "PETROGAL", "PT/CTT ACS", "SAD-PSP", "SAD/GNR (ADMG)", "SAMS", "SEG. SOCIAL", "Serviços Sociais do Ministério da Justiça", "OUTRAS"];
                    options = optionsRaw.map(function (v) {
                        return new Option(v, v);
                    });
                    magia = function () {
                        if ($(this).val() === "OUTRAS") {
                            $(this).replaceWith(
                                $('<div>', {class: 'input-append'})
                                    .append(
                                    $("<input>", {type: "text", id: $(this).prop("id"), name: $(this).prop("name")})
                                )
                                    .append(
                                    $('<btn>', {class: 'btn icon-alone'})
                                        .append(
                                        $('<i>', {class: 'icon-undo'})
                                    )
                                        .click(function () {
                                            $(this).parent().replaceWith(specialE.val("").change(magia));
                                        })
                                )
                            );
                        }
                    };
                    elmt
                        .append(options)
                        .change(magia);
                    specialE = elmt;
                } else if (this.name === "TITLE") {
                    elmt = $("<select>", {
                        id: this.name,
                        name: this.name,
                        class: "input-mini"
                    }).attr('data-prompt-position', 'topRight:120').append([new Option("", ""), new Option("Sr.", "Sr."), new Option("Sra. D.", "Sra. D.")]);
                } else if (this.name === "extra6") {
                    elmt = $("<input>", {type: "text", readonly: true, id: this.name, name: this.name, value: "NO"});
                } else if (this.name === "SECURITY_PHRASE") {
                    elmt = $("<input>", {type: "text", readonly: true, id: this.name, name: this.name, value: "SPICE"});
                } else if (this.name === "POSTAL_CODE") {
                    elmt = $("<input>", {type: "text", id: this.name, name: this.name}).change(function () {
                        if ((this.value.length)) {
                            $.post("ajax/client.php", {action: "check_postal_code", postal_code: this.value}, function (data1) {
                                if (data1.length) {
                                    var postal_codes = "";
                                    $.each(data1, function () {
                                        postal_codes += "<tr>\n\
                                 <td>" + this.rua + "</td>\n\
                                 <td>" + this.zona + "</td>\n\
                                 <td>" + this.localidade + "</td>\n\
                                 <td>" + this.concelho + "</td>\n\
                                 <td>" + this.distrito + "</td>\n\
                                 <td>" + this.cod_postal + "<div class='view-button'><button class='btn btn-mini postal_code_populate' data-mor='" + JSON.stringify(this) + "'><i class='icon-copy'></i> Copiar</button></div></td>\n\
                                            </tr>";
                                    });
                                    bootbox.dialog("<div class='alert alert-warning'>Foi encontrado um/varios codigos postais semelhantes.</div>\n\
                                        <table id='postal_code_table_check' class='table table-mod table-bordered table-striped table-condensed'>\n\
                                            <thead>\n\
                                                <tr>\n\
                                                    <td>Rua</td>\n\
                                                    <td>Zona</td>\n\
                                                    <td>Localidade</td>\n\
                                                   <td>Concelho</td>\n\
                                                    <td>Distrito</td>\n\
                                                    <td>Codigo Postal</td>\n\
                                                    </tr>\n\
                                            </thead>\n\
                                            <tbody>\n\
                                            " + postal_codes + "\n\
                                            </tbody>\n\
                                        </table><div class='clear'></div>", [{'OK': true, "label": "OK"}], {customClass: 'container'});
                                    $("#postal_code_table_check").on("click", ".postal_code_populate", function (e) {
                                        e.preventDefault();
                                        var that = $(this).data().mor;
                                        $("[name='ADDRESS1']").val(that.rua);
                                        $("[name='POSTAL_CODE']").val(that.cod_postal);
                                        $("[name='CITY']").val(that.localidade);
                                        $("[name='PROVINCE']").val(that.concelho);
                                        $("[name='STATE']").val(that.distrito);
                                        bootbox.hideAll();
                                    });
                                    $("#postal_code_table_check").DataTable();
                                }
                            }, "json");
                        }

                    });
                } else if (this.name === "COMMENTS") {
                    elmt = $("<textarea>", { id: this.name, name: this.name});
                } else if (this.name === "extra1") {
                    elmt = $("<input>", {type: "text", id: this.name, name: this.name});
                    new AutoCompleteCodMkt(elmt,false).init();
                } else {
                    elmt = $("<input>", {type: "text", id: this.name, name: this.name});
                }

                if (this.name === "PHONE_NUMBER" || this.name === "extra2" || this.name === "extra8") {
                    elmt.change(function () {
                        if (this.value.length < 9 && (this.name === "PHONE_NUMBER" || this.name === "extra8"))
                            return false;
                        $.post("ajax/client.php", {action: "byWhat", what: this.name, value: this.value}, function (clients) {
                            if (!clients.length)
                                return false;
                            var trs = "";
                            $.each(clients, function () {
                                trs += "<tr>\n\
                                        <td>" + this.refClient + "</td>\n\
                                        <td>" + this.nif + "</td>\n\
                                        <td>" + this.name + "</td>\n\
                                        <td>" + this.address1 + "</td>\n\
                                        <td>" + this.postal_code + "</td>\n\
                                        <td>" + this.city + "</td>\n\
                                        <td>" + this.phone + "</td>\n\
                                        <td>" + this.date_of_birth + "\n\
                                            <div class='view-button'>\n\
                                                <button class='btn btn-mini icon-alone ver_cliente' data-lead_id='" + this.id + "' title='Ver Cliente'><i class='icon-edit'></i></button>\n\
                                                <button class = 'btn btn-mini icon-alone criar_encomenda' data-lead_id ='" + this.id + "' title='Nova Encomenda'> <i class='icon-shopping-cart'></i></button>\n\
                                                <button class = 'btn btn-mini icon-alone criar_marcacao' data-lead_id ='" + this.id + "' title='Marcar Consulta'> <i class='icon-calendar'></i></button>\n\
                                            </div>\n\
                                        </td>\n\
                                   </tr>";
                            });
                            bootbox.dialog("<div class='alert alert-warning'>Foi encontrado um cliente com estes dados.</div>\n\
                                        <table class='table table-mod table-bordered table-striped table-condensed'>\n\
                                            <thead>\n\
                                                <tr>\n\
                                                    <td>Ref. Cliente</td>\n\
                                                    <td>Nif</td>\n\
                                                    <td>Nome</td>\n\
                                                    <td>Morada</td>\n\
                                                    <td>Cod. Postal</td>\n\
                                                    <td>Localidade</td>\n\
                                                    <td>Telefone</td>\n\
                                                    <td style='width:170px';>Data de Nasc.</td>\n\
                                               </tr>\n\
                                            </thead>\n\
                                            <tbody>\n\
                                            " + trs + "\n\
                                            </tbody>\n\
                                   </table>", [{'OK': true, "label": "OK"}], {customClass: 'container'}).on("click", ".criar_marcacao", function () {
                                bootbox.hideAll();
                                var en = btoa($(this).data().lead_id);
                                $.history.push("view/calendar.html?id=" + en);
                            }).on("click", ".criar_encomenda", function () {
                                bootbox.hideAll();
                                var
                                    data = $(this).data(),
                                    en = btoa(data.lead_id);
                                $.history.push("view/new_requisition.html?domain=ZXF1aXA%3D&id=" + en);
                            }).on("click", ".ver_cliente", function () {

                                var client = new ClientBox();

                                client.initModal($(this).data().lead_id, null);


                            });
                        }, "json");
                    });
                }

                switch (this.name) {
                    case "PHONE_NUMBER":
                        custom_class = "validate[required,custom[onlyNumberSp],minSize[9]]";
                        input = input1;
                        break;
                    case "ADDRESS3":
                    case "ALT_PHONE":
                        custom_class = "validate[custom[onlyNumberSp]]";
                        input = input1;
                        break;
                    case "FIRST_NAME":
                        custom_class = "validate[required]";
                        input = input1;
                        break;
                    case "DATE_OF_BIRTH":
                        custom_class = "form_datetime input-small validate[required]";
                        input = input1;
                        break;
                    case "EMAIL":
                        input = input1;
                        custom_class = "validate[custom[email]]";
                        break;
                    case "TITLE":
                        custom_class = "validate[required]";
                    case "extra8":
                        input = input1;
                        break;
                    case "extra2":
                        custom_class = "validate[custom[spice_ref_cliente]]";
                        input = input1;
                        break;
                    case "LAST_NAME":
                    case "MIDDLE_INITIAL":
                        input = input1;
                        break;
                    case "ADDRESS1":
                    case "CITY":
                        custom_class = "validate[required]";
                    case "POSTAL_CODE":
                        custom_class = "validate[required]";
                    case "ADDRESS2":
                    case "PROVINCE":
                    case "STATE":
                    case "COUNTRY_CODE":
                    case "extra3":
                    case "extra4":
                    case "extra10":
                        input = input2;
                        break;
                    case "extra6":
                    case "extra7":
                    case "SECURITY_PHRASE":
                        hide = " hide";
                        input = input3;
                        break;
                    case "extra1":
                        custom_class = "validate[required]";
                        input = input3;
                        break;
                    default:
                        hide = "";
                        input = input3;
                        break;
                }
                elmt.addClass(custom_class);
                input.append($("<div>", {class: "formRow" + hide})
                    .append($("<label>").text(this.display_name))
                    .append($("<div>", {class: "formRight"})
                        .append(elmt)));
                custom_class = "";
            });
            $("#inputs_div1").append($("<div>", {class: "clear"}));
            $("#inputs_div2").append($("<div>", {class: "clear"}));
            $("#inputs_div3").append($("<div>", {class: "clear"}));
            $("#PHONE_NUMBER").autotab('numeric');
            $(".form_datetime").datetimepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
                language: "pt",
                minView: 2,
                initialDate: new Date(moment().subtract('years', 65).format())
            }).attr('data-prompt-position', 'topRight:120');
            $.msg('unblock');
        },
        "json").fail(function (data) {
            $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
            $.msg('unblock', 5000);
        });
});
$("#form_create_client").submit(function (e) {
    e.preventDefault();
    if ($("#form_create_client").validationEngine("validate")) {
        $.msg();
        $.post("ajax/create_client.php", {action: "create_client", info: $("#form_create_client").serializeArray()},
            function (id) {
                $.jGrowl("Cliente '" + $("#FIRST_NAME").val() + "' criado com Sucesso", {sticky: 8000});
                $("#criar_marcacao").data("client_id", id).modal("show");
                $.msg('unblock');
            },
            "json").fail(function (data) {
                $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                $.msg('unblock', 5000);
            });
    }
});

$("#btn_criar_marcacao").click(function () {
    var en = btoa($("#criar_marcacao").modal("hide").data("client_id"));
    $.history.push("view/calendar.html?id=" + en + "&nc=1");
});
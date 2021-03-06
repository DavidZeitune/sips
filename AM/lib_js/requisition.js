var requisition = function (geral_path, options_ext, domain) {

    this.config = {};
    this.tipo = "mensal";

    var
        me = this,
        product_tree,
        jqModal = "",
        modal_anexo = "",
        table_path = "",
        produtos = [],
        EData;

    $.extend(true, this.config, options_ext);

    this.init = function (callback) {
        $.get("/AM/view/requisitions/requisition.html", function (data) {

            geral_path.append(data);
            geral_path.find("#new_requisition_div").hide();
            jqModal = geral_path.find("#ver_product_requisition_modal");
            modal_anexo = geral_path.find("#ver_anexo_requisition_modal");

            if (typeof callback === "function")
                callback();

        });
    };

    this.get_current_requisitions = function (table_path1) {
        table_path = table_path1;
        get_encomendas_atuais(table_path);
    };

    //NEW REQUISITION------------------------------------------------------------------------------------------------------------------------------------------------
    this.new_requisition = function (jqReq, lead_id) {
        var must_have_anexo = false;

        $("#product_selector").chosen({
            no_results_text: "Sem resultados"
        });

        if (lead_id) {
            me.tipo = "especial";
            jqReq.find("#tipo_especial").show();
            var client_box = new ClientBox({
                id: lead_id,
                byReserv: false
            });
            client_box.init();
        } else {
            me.tipo = "mensal";
            jqReq.find("#tipo_especial").hide();
        }

        $.msg();

        $.post('/AM/ajax/products.php', {
                action: "get_produtos",
                domain: domain
            },
            function (data) {
                var
                    option = "<option value='0'>Escolha um produto</option>",
                    optionGroups = "<optgroup data-alias='bte' label='BTE'></optgroup>\n\
                            <optgroup data-alias='rite' label='RITE'></optgroup>\n\
                            <optgroup data-alias='intr' label='INTRA'></optgroup>\n\
                            <optgroup data-alias='pilh' label='Pilhas'></optgroup>\n\
                            <optgroup data-alias='aces' label='Acessórios'></optgroup>\n\
                            <optgroup data-alias='mold' label='Moldes'></optgroup>\n\
                            <optgroup data-alias='econ' label='Economato'></optgroup>\n\
                            <optgroup data-alias='gama' label='Gama'></optgroup>\n\
                            <optgroup data-alias='cons' label='Consumiveis'></optgroup>\n\
                            <optgroup data-alias='espe' label='Especificidades'></optgroup>",
                    BTE = [],
                    RITE = [],
                    INTRA = [],
                    pilha = [],
                    acessorio = [],
                    molde = [],
                    economato = [],
                    gama = [],
                    consumiveis = [],
                    especificidades = [];

                $("#product_selector")
                    .append(option)
                    .append(optionGroups);

                $.each(data, function () {
                    produtos[this.id] = (this);
                    if (me.tipo === "especial") {
                        if (this.max_req_s < 1)
                            return true;
                    } else {
                        if (this.max_req_m < 1)
                            return true;
                    }
                    option = "<option value='" + this.id + "'>" + this.name + "</option>";
                    switch (this.category) {
                        case "BTE":
                            BTE.push(option);
                            break;
                        case "RITE":
                            RITE.push(option);
                            break;
                        case "INTRA":
                            INTRA.push(option);
                            break;
                        case "Pilha":
                            pilha.push(option);
                            break;
                        case "Acessório":
                            acessorio.push(option);
                            break;
                        case "Molde":
                            molde.push(option);
                            break;
                        case "Economato":
                            economato.push(option);
                            break;
                        case "Gama":
                            gama.push(option);
                            break;
                        case "Consumiveis":
                            consumiveis.push(option);
                            break;
                        case "Especificidades":
                            especificidades.push(option);
                            break;
                    }
                });
                $("#product_selector")
                    .find("optgroup[data-alias='bte']").append(BTE).end()
                    .find("optgroup[data-alias='rite']").append(RITE).end()
                    .find("optgroup[data-alias='intr']").append(INTRA).end()
                    .find("optgroup[data-alias='pilh']").append(pilha).end()
                    .find("optgroup[data-alias='aces']").append(acessorio).end()
                    .find("optgroup[data-alias='mold']").append(molde).end()
                    .find("optgroup[data-alias='econ']").append(economato).end()
                    .find("optgroup[data-alias='gama']").append(gama).end()
                    .find("optgroup[data-alias='cons']").append(consumiveis).end()
                    .find("optgroup[data-alias='espe']").append(especificidades).end().trigger("chosen:updated");
                $.msg('unblock');
            }, "json").fail(function (data) {
                $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                $.msg('unblock', 5000);
            });

        jqReq.off();
        jqReq.find('.fileupload').fileupload().end()
            .find("#form_encomenda_especial").validationEngine().end()
            .find("#form_encomenda_especial").show().end()
            .find(".tipo_div").hide().end()
            .find("#save_single_product").prop("disabled", true);

        jqReq.on("change", "#product_selector", function () {
            if (product_tree)
                product_tree.destroy();
            if (~~$(this).val() === 0) {
                jqReq.find("#save_single_product").prop("disabled", true);
                return false;
            } else {
                jqReq.find("#save_single_product").prop("disabled", false);
            }
            product_tree = new Tree("#tree", [produtos[$(this).val()]], me.tipo, $(this).val(), produtos);
            product_tree.init();
        });

        //----------------------------------------------------------------------------------------------------------------------------------------
        //-------------------------------------------------------------------------------------------SAVE SINGLE PRODUCT--------------------------
        jqReq.on("click", '#save_single_product', function () {
            var produtos_single = [],
                duplicate_array = [],
                has_products = 0;
            $.each($("#tree").find(".product_item"), function () {
                if ($(this).find("input[type=checkbox]").is(":checked")) {

                    if ($(this).prop("category_product") === "Molde" || $(this).prop("category_product") === "INTRA")
                        must_have_anexo = true;

                    has_products++;

                    if (duplicate_array.indexOf(($(this).prop("id_product"))) === -1) {
                        produtos_single.push({
                            id: $(this).prop("id_product"),
                            name: $(this).prop("name_product"),
                            category: $(this).prop("category_product"),
                            quantity: ~~$(this).find(".input_quantity").val(),
                            color_id: $(this).find(".color_select").val(),
                            color_name: $(this).find(".color_select option:selected").text(),
                            size: $(this).find(".input_size").val()
                        });
                    }

                    duplicate_array.push($(this).prop("id_product"));

                    if (me.tipo === "especial") {
                        produtos[$(this).prop("id_product")].max_req_s -= ~~$(this).find(".input_quantity").val();
                        if (produtos[$(this).prop("id_product")].max_req_s < 1)
                            jqReq.find("#product_selector").find("option[value='" + $(this).prop("id_product") + "']").prop("disabled", true).trigger("chosen:updated");
                    } else {
                        produtos[$(this).prop("id_product")].max_req_m -= ~~$(this).find(".input_quantity").val();
                        if (produtos[$(this).prop("id_product")].max_req_m < 1)
                            jqReq.find("#product_selector").find("option[value='" + $(this).prop("id_product") + "']").prop("disabled", true).trigger("chosen:updated");
                    }
                }
            });

            if (!has_products) {
                $.jGrowl('Selecione pelo menos 1 produto', {
                    life: 4000
                });
                return false;
            }
            jqReq.find("#product_selector").val(0).trigger("change");

            var
                new_product = ($("<div>", {
                    class: "grid"
                }).append($("<div>"))),
                produtos_in_text = new_product
                    .find("div:last")
                    .append($("<table>", {
                        class: "table table-mod table-striped table-condensed"
                    })
                        .append($("<thead>")
                            .append($("<tr>")
                                .append($("<th>").text("Nome").css("width", "420px"))
                                .append($("<th>").text("Categoria").css("width", "120px"))
                                .append($("<th>").text("Q.").attr("title", "Quantidade").css("width", "50px"))
                                .append($("<th>").text("Tamanho").attr("title", "Tamanho").css("width", "60px"))
                                .append($("<th>").text("Cor").css("width", "150px").append($("<button>", {class: "btn btn-danger btn-mini icon-alone right remove_produto_encomendado"})
                                    .append($("<i>", {class: "icon icon-trash"}))))))
                        .append($("<tbody>")))
                    .find("tbody");

            $.each(produtos_single, function () {
                produtos_in_text.append($("<tr>", {class: "product_line"})
                        .append($("<td>", {class: "td_name", id_product: this.id}).text(this.name))
                        .append($("<td>", {class: "td_category"}).text(this.category))
                        .append($("<td>", {class: "td_quantity"}).text(this.quantity))
                        .append($("<td>", {class: "td_size"}).text(this.size === 0 ? "" : this.size))
                        .append($("<td>", {class: "td_color", color: this.color_id}).text(this.color_name))
                );
            });

            jqReq.find("#produtos_encomendados").append(new_product).end()
                .find("#product_selector").val(0).trigger("chosen:updated");

        });

        //-------------------------------------------------------------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------- SUBMITAR A ENCOMENDA------------------------------
        jqReq.on("click", "#new_requisition_submit_button", function () {

            var upload_complete = 1;
            $.each(me.config.uploader.files, function () {
                if (this.percent !== 100) {
                    upload_complete = 0;
                    $.jGrowl('Certifique-se de que os ficheiros de anexo foram carregados para o servidor', {
                        life: 4000
                    });
                    return false;
                }
            });

            if (upload_complete) {
                var anexo_random_number = $(this).data().anexo_random_number;
                var produtos_encomenda = [];
                var count = 0;
                $.each(jqReq.find(" #produtos_encomendados tr"), function () {
                    if ($(this).hasClass("product_line")) {
                        count++;
                        produtos_encomenda.push({
                            id: $(this).find(".td_name").attr("id_product"),
                            quantity: ~~$(this).find(".td_quantity").text(),
                            color: $(this).find(".td_color").attr("color"),
                            color_name: $(this).find(".td_color").text(),
                            size: ~~$(this).find(".td_size").text()
                        });
                    }
                });
                if (!count)
                    $.jGrowl('Escolha pelo menos 1 produto', {
                        life: 4000
                    });
                else {
                    if (jqReq.find(" #form_encomenda_especial").validationEngine("validate")) {
                        if (must_have_anexo) {

                            if (!me.config.uploader.files.length) {
                                bootbox.alert("Certifique-se de que envia pelo menos um anexo pelos produtos Molde/Intra");
                                return false;
                            } else
                                must_have_anexo = false;
                        }
                        $("#form_encomenda_especial :input").attr('readonly', true);
                        $("#new_requisition_submit_button").prop("disabled", true);
                        $.msg();
                        $.post('ajax/requisition.php', {
                                action: "criar_encomenda",
                                type: me.tipo,
                                lead_id: lead_id,
                                contract_number: jqReq.find("#new_requisition_contract").val(),
                                attachment: me.config.uploader.files.length,
                                products_list: produtos_encomenda,
                                comments: jqReq.find("#new_requisition_obs").val(),
                                domain: domain
                            },
                            function (data) {
                                $("#form_encomenda_especial :input").attr('readonly', false);
                                $("#new_requisition_submit_button").prop("disabled", false);
                                $.jGrowl('Encomenda realizada com sucesso', {
                                    life: 4000
                                });
                                $.post('/AM/ajax/upload_file.php', {
                                        action: "move_files_to_new_folder",
                                        old_id: anexo_random_number,
                                        new_id: data[0]
                                    },
                                    function () {
                                        if (me.tipo === "mensal")
                                            $.history.push("view/new_requisition.html");
                                        else
                                            $.history.push("view/admin/pedidos.html?enc=0");
                                        $.msg('unblock');
                                    }, "json").fail(function (data) {
                                        $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                                        $.msg('unblock', 5000);
                                    });
                            }, "json").fail(function (data) {
                                $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                                $.msg('unblock', 5000);
                            });
                    }
                }
            }
        });

        jqReq.on("click", " .remove_produto_encomendado", function () {
            var this_button = $(this);
            bootbox.confirm("Tem a certeza que pretende remover esta encomenda? Certifique-se que não tem produtos selecionados na zona da Hierarquia", function (result) {
                if (result) {
                    $.each(this_button.closest(".grid").find("tr"), function () {
                        if ($(this).hasClass("product_line")) {
                            if (me.tipo === "especial")
                                produtos[$(this).find(".td_name").attr("id_product")].max_req_s = produtos[$(this).find(".td_name").attr("id_product")].max_req_s + ~~$(this).find(".td_quantity").text();
                            else
                                produtos[$(this).find(".td_name").attr("id_product")].max_req_m = produtos[$(this).find(".td_name").attr("id_product")].max_req_m + ~~$(this).find(".td_quantity").text();
                            jqReq.find("#product_selector").find("option[value='" + $(this).find(".td_name").attr("id_product") + "']").prop("disabled", false).trigger("chosen:updated");
                        }
                    });
                    jqReq.find("#product_selector").val(0).trigger("chosen:updated").trigger("change");
                    this_button.closest(".grid").remove();
                    //verificar se ainda ficou algum molde ou intra na encomenda (obrigatoriadade dos anexos)
                    must_have_anexo = false;
                    $.each($("#produtos_encomendados .product_line").find(".td_category"), function () {
                        if ($(this).text() === "INTRA" || $(this).text() === "Molde") {
                            must_have_anexo = true;
                            return false;
                        }
                    });
                }
            });
        });
        jqReq.on("submit", " #form_encomenda_especial", function (e) {
            e.preventDefault();
        });
    };

    function get_encomendas_atuais(jqTable) {
        var Table_view_requisition = jqTable.dataTable({
            "aaSorting": [
                [11, "asc"]
            ],
            "bSortClasses": false,
            "bProcessing": true,
            "bDestroy": true,
            "bAutoWidth": false,
            "sPaginationType": "full_numbers",
            "sAjaxSource": '/AM/ajax/requisition.php',
            "fnServerParams": function (aoData) {
                aoData.push({
                    "name": "action",
                    "value": "listar_requisition_to_datatable"
                }, {
                    "name": "show_aproved",
                    "value": jqTable.parents(".master_pedido_div").find(".toggle_aproved").find("i").hasClass("icon-eye-open")
                }, {
                    "name": "domain",
                    "value": domain
                });
            },
            "fnDrawCallback": function () {
                $.each(Table_view_requisition.find(".cod_cliente_input"), function () {
                    if (!$(this).val())
                        $(this).parent().parent().addClass("error");
                });
            },
            "aoColumns": [
                {
                    "sTitle": "Id"
                },
                {
                    "sTitle": "User",
                    "bVisible": SpiceU.user_level > 5,
                    "sWidth": "75px"
                },
                {
                    "sTitle": "Tipo",
                    "sWidth": "60px"
                },
                {
                    "sTitle": "Nome Cliente",
                    "sWidth": "90px"

                },
                {
                    "sTitle": "Data",
                    "sWidth": "125px"
                },
                {
                    "sTitle": "Nº de contrato"
                },
                {
                    "sTitle": "Ref. Cliente"
                },
                {
                    "sTitle": "Anexo",
                    "sWidth": "80px"
                },
                {
                    "sTitle": "Produtos",
                    "sWidth": "50px"
                },
                {
                    "sTitle": "Estado",
                    "sWidth": "95px"
                },
                {
                    "sTitle": "Opções",
                    "sWidth": "60px",
                    "bVisible": SpiceU.user_level > 5
                },
                {
                    "sTitle": "sort",
                    "bVisible": false
                },
                {
                    "sTitle": "object",
                    "bVisible": false
                }
            ],
            "oLanguage": {
                "sUrl": "../../../jquery/jsdatatable/language/pt-pt.txt"
            }
        });
        if (SpiceU.user_level > 5) {
            Table_view_requisition.on("change", ".cod_cliente_input", function () {
                var that = $(this);
                if (!$(this).validationEngine("validate")) {
                    if (that.val().length)
                        bootbox.confirm("Tem a certeza que pretende actualizar para o codigo:" + that.val() + "?", function (result) {
                            if (result) {
                                $.msg();
                                $.post('/AM/ajax/requisition.php', {
                                    action: "editar_encomenda",
                                    "clientID": that.data().clientid,
                                    "cod_cliente": that.val()
                                }, function () {
                                    that.closest("tr")
                                        .removeClass("error")
                                        .end()
                                        .replaceWith(that.val());
                                    Table_view_requisition.fnReloadAjax();
                                    $.msg('unblock');
                                }, "json").fail(function (data) {
                                    $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                                    $.msg('unblock', 5000);
                                });
                            }
                        });
                }
            });
        }
        else {
            $("#print_requisition").hide();
        }

        $('#export_ENC').click(function (event) {
            event.preventDefault();
            table2csv(Table_view_requisition, 'full', '#' + jqTable[0].id);
        });
        jqTable.on("click", ".ver_cliente", function () {
            var client = new ClientBox();
            client.initModal($(this).data("lead_id"), null);
        });
        //VER PRODUTOS DE ENCOMENDAS FEITAS
        jqTable.on("click", ".ver_requisition_products", function () {
            var that = this;
            $.msg();
            $.post('ajax/requisition.php', {
                action: "listar_produtos_por_encomenda",
                id: $(this).val()
            }, function (products) {
                var
                    modal_tbody = jqModal.find("#show_requisition_products_tbody").empty();
                EData = {
                    bInfo: [],
                    products: [],
                    id_req: 0
                };

                EData.id_req = ~~$(that).parents("tr").find("td").first().text();
                jqModal.find(".myModalLabel").text("Encomenda #" + EData.id_req);
                $.post('ajax/requisition.php', {
                    action: "get_encomenda",
                    id_req: EData.id_req
                }, function (encomenda) {
                    if (encomenda) {
                        EData.bInfo.push({
                            'ID encomenda': encomenda[0].id + "",
                            'User': encomenda[0].user + "",
                            'Tipo': encomenda[0].type + "",
                            'Id Client': encomenda[0].lead_id + "",
                            'Date': encomenda[0].date + "",
                            'Order Number': encomenda[0].contract_number + "",
                            'Client Ref.': encomenda[0].extra2 + "",
                            'Status': encomenda[0].status + ""
                        });
                    }
                    else
                        EData.bInfo.push({});

                    if (encomenda[0].comments.length)
                        jqModal.find("#show_requisition_modal_comments").show().end()
                            .find("#show_requisition_obs").text(encomenda[0].comments);
                    else
                        jqModal.find("#show_requisition_modal_comments").hide();
                    $.each(products, function () {
                        if (typeof this == "object") {
                            for (i = 0; i < this.qcs.length; i++) {


                                this.qcs[i].color_name = (!this.qcs[i].color_name) ? "Padrão" : this.qcs[i].color_name;
                                EData.products.push({
                                    Name: this.product_info.name,
                                    Category: this.product_info.category,
                                    Color: this.qcs[i].color_name,
                                    Qt: this.qcs[i].quantity,
                                    Size: this.qcs[i].size
                                });
                                if (this.product_info.category !== "Acessório")
                                    this.qcs.size = "";
                                modal_tbody.append("<tr><td>" + this.product_info.name + "</td><td>" + this.product_info.category + "</td><td>" + this.qcs[i].color_name + "</td><td>" + this.qcs[i].quantity + "</td><td>" + this.qcs[i].size + "</td></tr>");
                            }
                        }
                        else {
                            if (this.length)
                                modal_tbody.append("<tr ><td colspan='5'>" + data.comments + "</td> </tr>");
                            else
                                modal_tbody.append("<tr ><td colspan='5'>Sem comentários</td> </tr>");
                        }
                    });

                    jqModal.modal("show");
                    $.msg('unblock');
                }, "json");
            }, "json").fail(function (data) {
                $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                $.msg('unblock', 5000);
            });
        });
        jqTable.on("click", ".ver_requisition_anexo", function () {
            modal_anexo.modal("show");
            var this_folder = $(this).val() + "_encomenda";
            var this_id = $(this).parents("tr").find("td").first().text();
            $.msg();
            $.post('/AM/ajax/upload_file.php', {
                action: "get_anexos",
                folder: this_folder
            }, function (data) {
                if (data) {
                    var options = "";
                    $.each(data, function () {
                        options += "<tr><td>" + this + "<div class='view-button'><a class='btn btn-mini' href='/AM/ajax/files/" + this_folder + "/" + this + "' download='" + this + "'><i class='icon-download'></i>Download</a></div></td></tr>";
                    });
                    modal_anexo.find(".myModalLabel").text("Anexo #" + this_id);
                    modal_anexo.find("#show_requisition_anexos_tbody").html(options);
                }
                $.msg('unblock');
            }, "json").fail(function (data) {
                $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                $.msg('unblock', 5000);
            });
        });

        jqModal.on("click", "#print_requisition", function () {
            $.msg();
            var lead_id = ~~EData.bInfo[0]['Id Client'];
            //Ir buscar os comentarios
            $.post('ajax/requisition.php', {
                action: "listar_comments_por_encomenda",
                id: EData.id_req
            }, function (data) {
                var doc = new jsPDF('l', 'pt', 'a4', true);
                doc.table(30, 30, EData.bInfo, [
                    {name: 'ID encomenda', width: 100},
                    {name: 'User', width: 75},
                    {name: 'Tipo', width: 50},
                    {name: 'Id Client', width: 65},
                    {name: 'Date', width: 125},
                    {name: 'Order Number', width: 95},
                    {name: 'Client Ref.', width: 75},
                    {name: 'Status', width: 120}
                ], {
                    autoSize: false,
                    printHeaders: true
                });
                var
                    size = 16,
                    lines,
                    text = data;

                lines = doc.setFont('Times', 'Roman')
                    .setFontSize(size)
                    .splitTextToSize(text, 350);

                $.post('ajax/audiograma.php', {
                    action: "populate",
                    lead_id: lead_id
                }, function (oAudiograma) {
                    if (oAudiograma.length) {
                        if (data.length) {
                            lines = doc.setFont('Times', 'Roman')
                                .setFontSize(size)
                                .splitTextToSize(text, 350);
                            doc.text(428, doc.lastCellPos.y + 142, "Obs.");
                            doc.text(445, doc.lastCellPos.y + 165, lines);
                        }
                        var that = "";
                        var titles = [], values = [];
                        var temp_values = {};
                        $.each(oAudiograma, function () {
                            that = this;
                            $.each(that.value, function () {
                                titles.push(this.name);
                                temp_values[this.name] = this.value;
                            });
                            values.push(temp_values);
                            doc.setFontSize(10);
                            //doc.text(30, doc.lastCellPos.y + 52, that.name);
                            doc.table(30, doc.lastCellPos.y + 20, values, titles, {
                                autoSize: true,
                                printHeaders: true,
                                fontSize: 10
                            });
                            titles = [];
                            values = [];
                            temp_values = {};
                        });
                        //doc.addPage();
                        doc.table(30, doc.lastCellPos.y + 20, EData.products, [
                            {name: 'Name', width: 200},
                            {name: 'Category', width: 100},
                            {name: 'Color', width: 75},
                            {name: 'Qt', width: 50},
                            {name: 'Size', width: 50}
                        ], {
                            autoSize: false,
                            printHeaders: true
                        });
                    }
                    else {
                        doc.table(30, doc.lastCellPos.y + 60, EData.products, [
                            {name: 'Name', width: 200},
                            {name: 'Category', width: 100},
                            {name: 'Color', width: 75},
                            {name: 'Qt', width: 50},
                            {name: 'Size', width: 50}
                        ], {
                            autoSize: false,
                            printHeaders: true
                        });
                        if (data.length) {
                            lines = doc.setFont('Times', 'Roman')
                                .setFontSize(size)
                                .splitTextToSize(text, 750);
                            doc.text(20, doc.lastCellPos.y + 52, "Obs.");
                            doc.text(45, doc.lastCellPos.y + 75, lines);
                        }
                    }
                    doc.save(moment().format());
                }, "json").fail(function (data) {
                    $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                    $.msg('unblock', 5000);
                });
                $.msg('unblock');
            }, "json").fail(function (data) {
                $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                $.msg('unblock', 5000);
            });


        });

        jqTable.on("click", ".accept_requisition", function () {
            var this_button = $(this);
            bootbox.prompt("Comentários?", function (result) {
                if (result !== null) {
                    $.msg();
                    $.post('ajax/requisition.php', {
                        action: "accept_requisition",
                        id: this_button.val(),
                        message: result
                    }, function () {
                        Table_view_requisition.fnReloadAjax();
                        $.msg('unblock');
                    }).fail(function (data) {
                        $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                        $.msg('unblock', 5000);
                    });
                }
            });
        });

        jqTable.on("click", ".decline_requisition", function () {
            var this_button = $(this);
            bootbox.prompt("Motivo?", function (result) {
                if (result !== null) {
                    $.msg();
                    $.post('ajax/requisition.php', {
                        action: "decline_requisition",
                        id: this_button.val(),
                        message: result
                    }, function () {
                        Table_view_requisition.fnReloadAjax();
                        $.msg('unblock');
                    }).fail(function (data) {
                        $.msg('replace', ((data.responseText.length) ? data.responseText : 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.'));
                        $.msg('unblock', 5000);
                    });
                }
            });
        });
    }
};
<?php $campaign_id = "testeivr"; ?>

<div class="row-fluid">

    <div class="grid span6">
        <div class="grid-title">
            <div class="pull-left">Text to Convert</div>
            <div class="pull-right"></div>
            <div class="clear"></div>
        </div>
        <div class="grid-content">

            <textarea class="span" id="texto" name="texto" style="resize: none; height: 100px"></textarea>    
            <select id="lang">
                <!-- <option value='de'>Alemão</option>
                 <option value='pt-BR'>Brasil</option>
                 <option value='ca'>Catalão</option>
                 <option value='cs'>Checo</option>
                 <option value='zh-CN'>Chinês</option>
                 <option value='zh-TW'>Chinês Tradicional</option>
                 <option value='hr'>Croata</option>
                 <option value='da'>Dinamarquês</option>
                 <option value='es'>Espanhol</option>
                 <option value='fr'>Frances</option>
                 <option value='el'>Grego</option>
                 <option value='nl'>Holandês</option>
                 <option value='hu'>Hungariano</option>
                 <option value='is'>Icelandic</option>
                 <option value='en'>Inglês</option>
                 <option value='ga'>Irlandês</option>
                 <option value='it'>Italiano</option>
                 <option value='ja'>Japonês</option>
                 <option value='no'>Norueguês</option>
                 <option value='pl'>Polaco</option> -->
                <option value='pt-male' selected>Português - Masculino</option>
                <!--<option value='pt-female' selected>Português - Feminino</option>-->
                <!-- <option value='ro'>Romeno</option>
                <option value='ru'>Russo</option>
                <option value='sv'>Sueco</option>
                <option value='tr'>Turco</option>
                <option value='uk'>Ucraniano</option> -->
            </select>
    <!--        <select id='velocidade'>
                <option value=''>Velocidade</option>
                <option value='0.7'>70%</option>
                <option value='0.8'>80%</option>
                <option value='0.9'>90%</option>
                <option value='1'>100%</option>
                <option value='1.1'>110%</option>
                <option value='1.2'>120%</option>
                <option value='1.3'>130%</option>
                <option value='1.4'>140%</option>
            </select>-->
            <button class="right btn" onclick="ajaxgetsound('web')" >Listen on browser</button> 

            <button data-target="#basic-modal" data-toggle="modal" class="right btn" style='width:132px'  >Listen on phone</button>

            <div id="basic-modal" class="modal hide">
                <div class="modal-body">
                    <label for='ivrtest-phonetocall'>Phone Number</label>
                    <input id='ivrtest-phonetocall' type="text">   
                </div>
                <div class="modal-footer">
                    <a href="#" class="btn btn-primary" onclick="ajaxgetsound('phone')" data-dismiss="modal">Make Call</a>
                    <a href="#" class="btn btn-primary" data-dismiss="modal">Cancel</a>
                </div>
                <div class="clear"></div>
            </div> 

        </div>
    </div>

    <div class="grid span6">
        <div class="grid-title">
            <div class="pull-left">Audio Result</div>
            <div class="pull-right"></div>
            <div class="clear"></div>
        </div>
        <div class="grid-content">
            <center>

                <div style="min-height: 138px;">  

                    <div id="gravacao" >
                        <h5>Audio Player</h5>  

                        <audio controls="controls" id="wavplayer" name="wavplayer">
                            <source src="" type="audio/wav" >
                            O seu browser não suporta esta aplicação. Por favor utilize a versão mais recente do Firefox ou Chrome.
                        </audio>


                    </div>
                </div>
            </center>
            <div class="clear"></div>
        </div>
    </div>
</div>
<div class="row-fluid">

    <div class="grid span6">
        <div class="grid-title">
            <div class="pull-left">Add translation</div>
            <div class="pull-right"></div>
            <div class="clear"></div>
        </div>
        <div class="grid-content">
            <form class="form-horizontal" id="dictionary">
                <div  id="alert-text"></div>
                <div class="control-group">
                    <label class="control-label" for="origin-text">Uploaded Text</label>
                    <div class="controls">
                        <input type="text" id="origin-text" name="origin-text" placeholder="Original" required>
                    </div>
                </div>
                <div class="control-group">
                    <label class="control-label" for="replace-text">Text to be read by tts</label>
                    <div class="controls">
                        <input type="text" id="translate-text" name="translate-text" placeholder="Changed" required>
                    </div>
                </div>
                <div class="control-group">
                    <div class="controls">
                        <button class="btn btn-success"><i class="icon-plus"></i>Add</button>
                    </div>
                </div>
            </form>
            <div class="clear"></div>
        </div>
    </div>
    <div class="grid span6">
        <div class="grid-title">
            <div class="pull-left">List</div>
            <div class="pull-right"></div>
            <div class="clear"></div>
        </div>
        <div class="grid-content">
            <table id="list-trad" class="table table-mod-2">
                <thead>
                    <tr>
                        <th>Origin</th>
                        <th>Translation</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <div class="clear"></div>
        </div>
    </div>
</div>
</div>


</div>

<!-- DIV construtor de mensagem -->



<script>


    function ajaxgetsound(action) {

        if (action === 'phone') {
            //    phone = prompt("Insira o nº de telefone"); 
            var phone = $("#ivrtest-phonetocall").val();
            var velocidade = $("#velocidade").val();
            var texto = $("#texto").val();
            var lingua = $("#lang").val();

            $.post('../dixi/requests.php', {action: 'browser-phone', data: texto, lang: lingua, phone: phone, campaign_id: "<?= $campaign_id; ?>", velocidade: velocidade}, function(data) {


            });

        } else if (action === 'web') {
            var velocidade = $("#velocidade").val();
            var texto = $("#texto").val();
            var lingua = $("#lang").val();

            $.post('../dixi/requests.php', {data: texto, lang: lingua, velocidade: velocidade, action: 'browser-listen', user: "web"}, function(data) {
                $('.result').html(data);

                texto_ivr = data;
                var audioplayer = $('#wavplayer').prop("autoplay", true).empty();

                $("<source>").attr("src", "../dixi/files/" + data + ".mp3").appendTo(audioplayer);

                audioplayer[0].load();
                $("#gravacao").show();

            });
        }
    }
    var oTable;
    $("#dictionary").submit(function(e) {
        e.preventDefault();
        var that = $(this);
        $.post("../intra_testivr/dictionary.php",
                {
                    action: "insert",
                    origin: that.find("#origin-text").val(),
                    trans: that.find("#translate-text").val()
                },
        function(data) {
            if (data.error) {
                    makeAlert("#alert-text", "Warning!", data.msg, 2, 1, 0);
                return false;
            }

            oTable.fnAddData([
                that.find("#origin-text").val(),
                that.find("#translate-text").val(),
                "<button class='btn btn-danger icon-alone ' data-id='" + data.id + "' ><i class='icon-trash'></i></button>"]);
            that[0].reset();
        }, "json");
    });

    oTable = $('#list-trad').dataTable({"aaSorting": [[0, "asc"]],
        "bSortClasses": false,
        "bProcessing": true,
        "bDestroy": true,
        "bAutoWidth": false,
        "sPaginationType": "full_numbers",
        "fnServerParams": function(aoData) {
            aoData.push({"name": "action", "value": "get_info_client"},
            {"name": "action", "value": "getAll"}
            );
        },
        "sAjaxSource": '../intra_testivr/dictionary.php'
    });

    $('#list-trad tbody').on("click", "button", function() {
        var that = this;
        $.post('../intra_testivr/dictionary.php', {action: "delete", id: $(that).data().id}, function() {

            var aPos = oTable.fnGetPosition($(that).closest("td")[0]);

            oTable.fnDeleteRow(aPos[0]);
        }, "json");
    });


</script>    



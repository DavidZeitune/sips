/* Author RTeixeira
 *
 *
 * Requires:
 * jQuery 1.9.0+,
 * jQuery msg plugin 1.0.0+ http://dreamerslab.com/demos/jquery-blockui-alternative-with-jquery-msg-plugin
 * jQuery bootbox plugin 3.0.0+ http://bootboxjs.com/
 * jQuery fullcalendar plugin v1.6.4 https://github.com/arshaw/fullcalendar/releases/tag/v1.6.4
 * MomentJS http://momentjs.com/
 */

var Calendar;
Calendar = (function () {
    function Calendar(selector, data, modals, ext, client, user) {
        var me = this;
        this.user = user;
        this.selector = selector;
        this.client = client || {};
        this.ext = ext;
        this.resource = "all";
        this.modals = modals;
        this.modal_ext = modals.client;

        this.modal_special = modals.special;
        this.calendar = undefined;

        this.config = {
            header: {
                center: 'agendaDay agendaWeek month'
            },
            events: {
                url: "/AM/ajax/calendar.php",
                type: "POST",
                data: {
                    action: "GetReservations",
                    resource: "all"
                }
            },
            columnFormat: {
                month: 'ddd',
                week: 'ddd d/M',
                day: 'dddd'
            },
            titleFormat: {
                month: 'MMMM yyyy',
                week: "MMMM yyyy",
                day: 'd MMMM yyyy'
            },
            slotMinutes: 15,
            allDaySlot: false,
            defaultView: "agendaWeek",
            allDayDefault: false,
            unselectAuto: true,
            slotEventOverlap: false,
            timeFormat: 'H:mm{ - H:mm}',
            axisFormat: 'H:mm',
            dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            firstDay: 1,
            firstHour: (function () {
                return ~~new Date().getUTCHours() - 2;
            })(),
            buttonText: {
                today: 'hoje',
                month: 'mês',
                week: 'semana',
                day: 'dia'
            },
            eventClick: function (calEvent) {
                var problem = false;
                if (isBlocked() && calEvent.start > new Date().getTime()) {
                    $.msg({
                        content: "Devido às consultas em atraso por fechar, esta funcionalidade não lhe permite qualquer tipo de acção com marcações posteriores a hoje.",
                        autoUnblock: true,
                        timeOut: "5000"
                    });
                    problem = false;
                } else if (calEvent.transformer) {
                    me.fnOpenModalService(calEvent);
                    problem = true;
                } else if (calEvent.useful) {
                    me.openACF(calEvent);
                    problem = true;
                } else if (calEvent.bloqueio && calEvent.system) {
                    me.openMkt(calEvent);
                    problem = true;
                } else if (calEvent.bloqueio || calEvent.del) {
                    problem = false;
                } else if (calEvent.system) {
                    me.openSpecialEvent(calEvent);
                    problem = true;
                } else if (calEvent.sale) {
                    me.openClient(calEvent);
                    problem = true;
                }
                return problem;
            },
            droppable: {
                agenda: true,
                month: false
            },
            drop: function (date) {
                $.msg();
                var
                    cEO = $.extend({rsc_name: $("[name='single-refs']:checked").data().text}, $(this).data('eventobject'));

                cEO.start = moment(date).unix();

                if (cEO.min) {
                    cEO.end = moment(date).add("minutes", cEO.min).unix();
                } else {
                    cEO.end = moment(date).add("minutes", config.defaultEventMinutes).unix();
                }

                var testes = [
                    {
                        test: function () {
                            return !me.calendar.fullCalendar('getView').name.match("agenda");
                        },
                        msg: "Não é permitido marcar consultas em modo de visualização mensal."
                    },
                    {
                        test: function () {
                            return date < (moment().subtract('h', '10').format('X') * 1000);
                        },
                        msg: "Não é permitido marcar consultas anteriores ao dia actual."
                    },
                    {
                        test: function () {
                            return me.concorrency(cEO);
                        },
                        msg: "Não é permitido marcações concorrentes."
                    }
                ];

                result = assert(testes);

                if (!result) {
                    $.msg('replace', result.msg);
                    $.msg('unblock', 3000);
                    $(".popover").remove();
                    return false;
                }

                $.post("/AM/ajax/calendar.php", {
                        action: "newReservation",
                        resource: me.resource,
                        rtype: cEO.rtype,
                        lead_id: cEO.lead_id,
                        start: cEO.start,
                        end: cEO.end
                    },
                    function (id) {
                        cEO.id = id;
                        me.calendar.fullCalendar('renderEvent', cEO, true);
                        $("#external-events").remove();
                        $.msg('unblock');

                        if (cEO.sale && (typeof me.client.nc === "undefined")) {
                            me.newCodMkt(cEO);
                        } else if (cEO.transformer) {
                            fnUpdateCodMKT(me, cEO, fnMakeServiceCodMKT());
                        }
                    },
                    "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                    });
                return true;

            },
            eventRender: function (event, element) {
                var d = {
                    bloqueio: false,
                    changed: 0,
                    className: "",
                    client_name: "",
                    closed: false,
                    codCamp: "",
                    del: false,
                    editable: false,
                    end: "",
                    id: 0,
                    lead_id: 0,
                    max: 0,
                    min: 0,
                    obs: "",
                    postal: "",
                    rsc: 0,
                    start: "",
                    system: false,
                    title: "",
                    user: ""
                };

                event = $.extend(d, event);

                if (!event.url && !event.bloqueio) {
                    element.popover({
                        placement: function (context, source) {
                            var position = $(source).position();

                            if (position.top < 110) {
                                return "bottom";
                            }
                            if (me.calendar.fullCalendar('getView').name === "agendaDay") {
                                return "top";
                            }
                            if (position.left > 515) {
                                return "left";
                            }
                            if (position.left < 515) {
                                return "right";
                            }
                            return "top";
                        },
                        html: true,
                        title: event.title,
                        content: (function () {
                            if (!event.system) {
                                return '<dl class="dl-horizontal"><dt>Nome</dt><dd>- ' + event.client_name + '</dd><dt>Cod. Mkt.</dt><dd>- ' + event.codCamp + '</dd><dt>Cod Postal</dt><dd>- ' + event.postal + '</dd></dl>';
                            } else {
                                return event.obs;
                            }
                        })(),
                        trigger: 'hover',
                        container: 'body'
                    });
                }
                element
                    .find(".fc-event-time")
                    .before($("<span>", {
                        class: "fc-event-icons"
                    })
                        .append(function () {
                            return (event.changed) ? $("<b>", {
                                text: "R" + event.changed + " "
                            }) : "";
                        })
                        .append(function () {
                            return (!event.system || (event.bloqueio && event.system)) ? $("<i>", {
                                class: ((event.closed) ? "icon-lock" : "icon-unlock")
                            }) : "";
                        }))
                    .append($("<span>", {
                        text: (function (obs) {
                            try {
                                return JSON.parse(obs).obs;
                            }
                            catch (e) {
                                return obs;
                            }
                        })(event.obs),
                        class: "fc-event-obs"
                    }));

            },
            eventDrop: function (event, dayDelta, minuteDelta, allDay, revertFunc) {
                $.msg();
                var
                    testes = [
                        {
                            test: function () {
                                return event.start < (moment().subtract('h', '10').format('X') * 1000);
                            },
                            msg: 'Não é permitido marcar consultas anteriores ao dia actual.'
                        },
                        {
                            test: function () {
                                return me.concorrency(event);
                            },
                            msg: 'Não é permitido marcações concorrentes.'
                        }
                    ],
                    result;


                result = assert(testes);

                if (result !== true) {
                    $.msg('replace', result.msg);
                    $.msg('unblock', 3000);
                    $(".popover").remove();
                    revertFunc();
                } else {
                    $.msg('unblock');
                    me.change(event, dayDelta, minuteDelta, revertFunc);
                }
                return true;
            },
            eventResize: function (event, dayDelta, minuteDelta, revertFunc) {
                $.msg();
                var
                    testes = [
                        {
                            test: function () {
                                return event.max && (moment.duration(moment(event.end).diff(moment(event.start))).asMinutes() > event.max);
                            },
                            msg: "A duração maxima deste tipo de maracação é: " + event.max + "m."
                        },
                        {
                            test: function () {
                                return event.min && (moment.duration(moment(event.end).diff(moment(event.start))).asMinutes() < me.config.slotMinutes);
                            },
                            msg: "A duração mínima deste tipo de maracação é: " + me.config.slotMinutes + "m."
                        },
                        {
                            test: function () {
                                return event.start < (moment().subtract('h', '10').format('X') * 1000)
                            },
                            msg: "Não é permitido alterar o passado."
                        },
                        {
                            test: function () {
                                return me.concorrency(event)
                            },
                            msg: "Não é permitido marcações concorrentes."
                        }
                    ],
                    result;

                result = assert(testes);

                if (result !== true) {
                    $.msg('replace', result.msg);
                    $.msg('unblock', 3000);
                    $(".popover").remove();
                    revertFunc()
                } else {
                    $.msg('unblock');
                    me.change(event, dayDelta, minuteDelta, revertFunc);
                }
                return true;
            }
        };

        this.resource = (typeof data.config !== "undefined" && typeof data.config.events !== "undefined") ? data.config.events.data.resource : "all";
        var config = $.extend(true, this.config, data.config);
        this.calendar = selector.fullCalendar(config);

        $("body").off().keydown(function (e) {
            var actions = {
                37: function () {
                    me.calendar.fullCalendar('prev');
                },
                39: function () {
                    me.calendar.fullCalendar('next');
                }
            };
            if (typeof actions[e.keyCode] === "function") {
                actions[e.keyCode]();
                $(".popover").remove();
            }
        });

        if (me.user.user_level > 4 || 1) {
            me.modal_ext.find("#btn_change").removeClass("hide");
        }
    }


    var assert = function (testes) {
        while (test = testes.shift()) {
            if (test.test()) {
                return test;
            }
        }
        return true;
    };

    Calendar.prototype.change = function (event, dayDelta, minuteDelta, revertFunc) {
        var me = this;
        $(".popover").remove();
        bootbox.confirm("Pretende mesmo mudar a data/hora?", function (result) {
            if (result) {
                $.msg();
                $.post("/AM/ajax/calendar.php", {
                        id: event.id,
                        action: "change",
                        start: moment(event.start).unix(),
                        end: moment(event.end).unix()
                    },
                    function (ok) {
                        if (!ok) {
                            revertFunc();
                        }
                        event.changed++;
                        me.calendar.fullCalendar('updateEvent', event);
                        $.msg('unblock');
                    }, "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                        revertFunc();
                    });
            } else {
                revertFunc();
            }
        })

    };

    Calendar.prototype.reserveConstruct = function (tipo) {
        var me = this,
            n,
            sElements = "",
            sClasses = "";
        $.each(tipo, function () {
            if (this.active && !this.hide) {
                n = {
                    className: "t" + this.id,
                    rtype: this.id,
                    min: this.min,
                    max: this.max,
                    sale: this.sale,
                    useful: this.useful,
                    transformer: this.transformer
                };
                sElements += "<div class=\"external-event t" + this.id + "\" data-eventobject=" + JSON.stringify(n) + " >" + this.text + "</div>";
            }
            sClasses += this.css;
        });

        $("#external-events").find(" .grid-content").html(sElements);
        $("#reserve_types").html(sClasses);

        var
            eventobject;

        me.ext
            .find('div.external-event')
            .each(function () {
                eventobject = $.extend({
                    editable: true,
                    title: $.trim($(this).text()),
                    lead_id: me.client.id,
                    client_name: me.client.name,
                    codCamp: me.client.codCamp,
                    postal: me.client.postalCode,
                    type_text: $.trim($(this).text()),
                    user: SpiceU.username,
                    closed: false
                }, $(this).data().eventobject);

                $(this).data('eventobject', eventobject);

                $(this).draggable({
                    zIndex: 999,
                    revert: true,
                    revertDuration: 0
                });

            });

        if (typeof me.client.id !== "undefined" && me.resource !== "all") {
            me.ext.show();
        } else {
            me.ext.hide();
        }
    };

    Calendar.prototype.makeRefController = function (Refs) {
        var me = this;
        var sTR = "<tr><td class=\"chex-table\"><input type=\"radio\" checked name=\"single-refs\" value=\"all\" id=\"all\" ><label for=\"all\"><span></span></label></td><td><label for=\"all\" class=\"btn-link\">Todos</label></td></tr>";
        $.each(Refs, function () {
            sTR += "<tr><td class=\"chex-table\"><input type=\"radio\" name=\"single-refs\" value=\"" + this.id + "\" id=\"" + this.id + "\" data-text=\"" + this.name + "\" ><label for=\"" + this.id + "\"><span></span></label></td><td><label for=\"" + this.id + "\" class=\"btn-link\">" + this.name + "</label></td></tr>";
        });
        $("#refs")
            .find("tbody")
            .html(sTR)
            .find("[name=single-refs]")
            .change(function () {
                $.msg();
                $.post("/AM/ajax/calendar.php", {
                        resource: $(this).val(),
                        action: "getRscContent"
                    },
                    function (dat) {
                        me.destroy();
                        me = new Calendar(me.selector, dat, me.modals, me.ext, me.client, me.user);
                        me.reserveConstruct(dat.tipo);
                        $.msg('unblock');
                    }, "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                    });
            });
    };

    function fnDeleteEvent(id, me) {
        bootbox.confirm("Tem a certeza que pretende eliminar a marcaçao?", function (result) {
            if (!result)
                return;

            $.post("/AM/ajax/calendar.php", {
                    id: id,
                    action: "remove"
                },
                function (ok) {
                    if (ok) {
                        me.calendar.fullCalendar('removeEvents', id);
                        dropOneConsult();
                    }
                    $.msg('unblock');
                }, "json").fail(function () {
                    $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                    $.msg('unblock', 5000);
                });
        })
    }

    Calendar.prototype.initModal = function (Refs) {
        var me = this;
        me.modal_ext
            .find("#btn_no_consult")
            .popover({
                placement: "top",
                html: true,
                title: "Não há consulta",
                content: '<form  id="no_consult_confirm">\n\
                                <select id="select_no_consult" class="validate[required]">\n\
                                    <option value="">Seleccione um opção</option>\n\
                                    <option value="NOSHOW">No Show</option>\n\
                                    <option value="DEST">Desistiu</option>\n\
                                    <option value="TINV">Telefone Invalido</option>\n\
                                    <option value="NAT">Ninguém em casa</option>\n\
                                    <option value="MOR">Morada Errada</option>\n\
                                    <option value="FAL">Faleceu</option>\n\
                                </select>\n\
                                <button class="btn btn-primary">Fechar</button>\n\
                            </form>',
                trigger: 'click'
            })
            .on("hidden", function (e) {
                e.stopPropagation();
            })
            .end()
            .on("submit", "#no_consult_confirm", function (e) {
                e.preventDefault();
                $.msg();
                var calendar_client = me.modal_ext.data(),
                    cResult = $("#select_no_consult").val();
                if ($(this).validationEngine('validate')) {
                    $.post("/AM/ajax/consulta.php", {
                            action: "insert_consulta",
                            reserva_id: calendar_client.calEvent.id,
                            lead_id: calendar_client.calEvent.lead_id,
                            closed: 1,
                            consulta: 0,
                            consulta_razao: cResult,
                            exame: "0",
                            exame_razao: "",
                            venda: 0,
                            venda_razao: "",
                            left_ear: 0,
                            right_ear: 0,
                            tipo_aparelho: "",
                            produtos: "",
                            descricao_aparelho: "",
                            feedback: "SCONS"
                        },
                        function () {
                            calendar_client.calEvent.editable = false;
                            calendar_client.calEvent.closed = true;
                            calendar_client.calEvent.del = (cResult === 'DEST' || cResult === 'NOSHOW');
                            calendar_client.calEvent.className += (cResult === 'DEST' || cResult === 'NOSHOW') ? ' del' : '';
                            me.calendar.fullCalendar('updateEvent', calendar_client.calEvent);
                            dropOneConsult();
                            $.msg('unblock');
                        }, "json").fail(function () {
                            $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                            $.msg('unblock', 5000);
                        });
                    me.modal_ext.modal("hide").find(".popover").hide();
                }
            })
            .find("#btn_change")
            .popover({
                placement: "top",
                html: true,
                title: "Mudar de calendário",
                content: function () {
                    var
                        opt = "",
                        rsc = me.modal_ext.data().calEvent.rsc;

                    if (Refs.length < 2) {
                        return '<div class="alert">Não tem calendários para alterar a marcação.</div>';
                    }
                    $.each(Refs, function () {
                        if (~~this.id !== rsc) {
                            opt += "<option value='" + this.id + "'>" + this.name + "</option>\n";
                        }
                    });
                    return '<select id="select_change">\n' + opt + '</select>\n\
                            <button class="btn btn-primary" id="change_confirm_button">Mudar</button>';
                },
                trigger: 'click'
            })
            .on("hidden", function (e) {
                e.stopPropagation();
            })
            .end()
            .on("click", "#change_confirm_button", function () {
                $.msg();
                var calendar_client = me.modal_ext.data().calEvent;
                $.post("/AM/ajax/calendar.php", {
                        action: "changeReservationResource",
                        id: calendar_client.id,
                        resource: $("#select_change").val()
                    },
                    function () {
                        me.calendar.fullCalendar('removeEvents', calendar_client.id);
                        $.msg('unblock');
                    }, "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                    });
                me.modal_ext.modal("hide").find(".popover").hide();
            })
            .on("hidden", function () {
                $(this)
                    .find("#btn_change")
                    .popover('hide');
                $(this)
                    .find("#btn_no_consult")
                    .popover('hide');
            })
            .find(".btn_trash")
            .click(function () {
                $.msg();
                me.modal_ext.modal("hide");
                var data = me.modal_ext.data().calEvent;

                fnDeleteEvent(data.id, me);
            })
            .end()
            .css({
                overflow: "visible"
            })
            .find("#btn_init_consult")
            .add("#btn_view_consult")
            .click(function () {
                var
                    data = me.modal_ext.modal("hide").data().calEvent,
                    en = btoa(data.lead_id),
                    rs = btoa(data.id);
                $.history.push("view/consulta.html?id=" + encodeURIComponent(en) + "&rs=" + encodeURIComponent(rs));
            });


        me.modal_special
            .find(".btn_trash")
            .click(function () {
                $.msg();
                me.modal_special.modal("hide");
                var id = me.modal_special.data().calEvent.id;
                $.post("/AM/ajax/calendar.php", {
                        id: id,
                        action: "remove"
                    },
                    function (ok) {
                        if (ok) {
                            me.calendar.fullCalendar('removeEvents', id);
                        }
                        $.msg('unblock');
                    }, "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                    });
            });

        me.modals.mkt.find("form").submit(function (e) {
            e.preventDefault();
            if (me.modals.mkt.find("form").validationEngine('validate')) {
                $("#save_mkt").prop('disabled', true);
                $.msg();
                $.post("ajax/requests.php", {
                    action: 'set_mkt_report',
                    id: me.modals.mkt.data().calEvent.extra_id,
                    cod: $(this).find('#cod').val(),
                    total_rastreios: $(this).find('#total_rastreios').val(),
                    rastreios_perda: $(this).find('#rastreios_perda').val(),
                    vendas: $(this).find('#vendas').val(),
                    valor: $(this).find('#valor').val()
                }, function () {
                    me.modals.mkt.modal("hide");
                    $("#save_mkt").prop('disabled', false);
                    $.jGrowl("Relatório enviado com sucesso!");
                    $.msg('unblock');
                    var eApoio = $("#calendar").fullCalendar("clientEvents", function (a) {
                        return a.extra_id === me.modals.mkt.data().calEvent.extra_id;
                    });
                    $.each(eApoio, function () {
                        this.closed = true;
                        me.calendar.fullCalendar('updateEvent', this);
                    });
                }, 'json').fail(function () {
                    $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                    $.msg('unblock', 5000);
                });

            }
        })
            .find("input:not(:eq(0))").autotab('number');


        me.modals.acf.find("#save_acf").click(function () {
            //in single element validations on the contrary (ﾉಠ_ಠ)ﾉ
            if (!me.modals.acf.find("#obs_acf").validationEngine('validate')) {
                $.msg();
                $.post("ajax/calendar.php", {
                    action: 'set_reservation_obs',
                    obs: me.modals.acf.find("#obs_acf").val(),
                    id_reservation: ~~me.modals.acf.data("calEvent").id
                }, function () {
                    me.modals.acf.find("#obs_acf").val("");
                    me.modals.acf.modal("hide");
                    me.modals.acf.data().calEvent.closed = true;
                    me.modals.acf.data().calEvent.editable = false;
                    me.calendar.fullCalendar('updateEvent', this);
                    $.msg('unblock');
                }, 'json').fail(function () {
                    $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                    $.msg('unblock', 5000);
                });
            }
        })
            .end()
            .find(".btn_trash")
            .click(function () {
                $.msg();
                me.modals.acf.modal("hide");
                var id = me.modals.acf.data().calEvent.id;
                $.post("/AM/ajax/calendar.php", {
                        id: id,
                        action: "remove"
                    },
                    function (ok) {
                        if (ok) {
                            me.calendar.fullCalendar('removeEvents', id);
                        }
                        $.msg('unblock');
                    }, "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                    });
            });

    };

    Calendar.prototype.openClient = function (calEvent) {
        var me = this;
        $.msg();
        $.post("/AM/ajax/client.php", {
            id: calEvent.lead_id,
            action: 'byName'
        }, function (data) {
            $.msg('unblock');
            var sDT = "";
            $.each(data, function () {
                sDT += "<dt>" + this.name + "</dt><dd>- " + this.value + "</dd>";
            });
            if (calEvent.closed) {
                me.modal_ext
                    .find(".modal-footer span")
                    .hide()
                    .end()
                    .find("#btn_view_consult")
                    .show();
            } else if (me.user.user_level < 5) {
                me.modal_ext
                    .find(".modal-footer span.left")
                    .show()
                    .end()
                    .find(".modal-footer button.btn_trash")
                    .toggle(calEvent.user === me.user.username)
                    .end()
                    .find(".modal-footer span.right")
                    .show()
                    .end()
                    .find(".modal-footer span.right #btn_init_consult")
                    .toggle(me.user.user_level !== 1)
                    .end()
                    .find("#btn_view_consult")
                    .hide();
            } else {
                me.modal_ext
                    .find(".modal-footer span, .modal-footer span .btn")
                    .show()
                    .end()
                    .find("#btn_view_consult")
                    .hide();
            }
            me.modal_ext
                .find("#client_info")
                .html(sDT);
            me.modal_ext
                .data({
                    calEvent: calEvent
                })
                .modal();
        }, "json").fail(function () {
            $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
            $.msg('unblock', 5000);
        });
    };

    Calendar.prototype.openSpecialEvent = function (calEvent) {
        var me = this;

        if (calEvent.user !== me.user.username && me.user.user_level < 5) {
            me.modal_special
                .find(".btn_trash")
                .hide();
        } else {
            me.modal_special
                .find(".btn_trash")
                .show();
        }

        me.modal_special
            .find(".modal-body")
            .html(calEvent.obs);
        me.modal_special
            .data({
                calEvent: calEvent
            })
            .modal();
    };

    Calendar.prototype.openMkt = function (calEvent) {
        var me = this;
        $.msg();
        $.post("ajax/requests.php", {
            action: 'get_one_mkt',
            id: calEvent.extra_id
        }, function (data) {
            var postal = (function () {
                var pt = "";
                $.each(data.local_publicidade, function () {
                    pt += '<dd>' + this.cp + ' - ' + this.freguesia + '</dd>';
                });
                return pt;
            })();
            var html = '<dl class="dl-horizontal">\n\
                            <dt>Pedido</dt>\n\
                            <dd>-' + moment(data.data_criacao).fromNow() + '</dd>\n\
                            <dt>Localidade</dt>\n\
                            <dd>-' + data.localidade + '</dd>\n\
                            <dt>Local</dt>\n\
                            <dd>-' + data.local + '</dd>\n\
                            <dt>Morada</dt>\n\
                            <dd>-' + data.morada + '</dd>\n\
                            <dt>Observações</dt>\n\
                            <dd>-' + data.comments + '</dd>\n\
                            <dt>Códigos Postais</dt>\n\
                            ' + postal + '\n\
                        </dl>';
            me.modals.mkt
                .find("#tab_mkt_info").html(html)
                .end()
                .data({
                    calEvent: calEvent
                })
                .find("#tab_mkt_rel")
                .find("#cod").val((~~data.closed) ? data.cod : '').prop('readonly', ~~data.closed).end()
                .find("#total_rastreios").val((~~data.closed) ? data.total_rastreios : '').prop('readonly', ~~data.closed).end()
                .find("#rastreios_perda").val((~~data.closed) ? data.rastreios_perda : '').prop('readonly', ~~data.closed).end()
                .find("#vendas").val((~~data.closed) ? data.vendas : '').prop('readonly', ~~data.closed).end()
                .find("#valor").val((~~data.closed) ? data.valor : '').prop('readonly', ~~data.closed).end()
                .find("#save_mkt").prop('disabled', ~~data.closed).end()
                .end()
                .modal('show');
            $.msg('unblock');
        }, 'json').fail(function () {
            $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
            $.msg('unblock', 5000);
        });
    };

    Calendar.prototype.openACF = function (calEvent) {
        var me = this;
        me.modals.acf
            .data("calEvent", calEvent)
            .find("h3")
            .text(calEvent.type_text + ' ' + calEvent.client_name)
            .end()
            .find("#obs_acf")
            .validationEngine('hide');

        $.msg();
        $.post("/AM/ajax/calendar.php", {
                action: "get_reservation_obs",
                id_reservation: calEvent.id
            },
            function (data) {
                if (data.obs) {
                    me.modals.acf
                        .find("#obs_acf")
                        .prop("disabled", true)
                        .val(data.obs)
                        .end()
                        .find("#save_acf,.btn_trash")
                        .hide();
                }
                else {
                    me.modals.acf
                        .find("#obs_acf")
                        .val("")
                        .prop("disabled", false)
                        .end()
                        .find("#save_acf,.btn_trash")
                        .show();
                }
                $.msg('unblock');
            },
            "json").fail(function () {
                $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                $.msg('unblock', 5000);
            });

        me.modals.acf.modal("show");
    };

    Calendar.prototype.concorrency = function (event) {
        var me = this;
        var start, end;

        if (event.start instanceof Date) {
            start = event.start;
            end = event.end;
        } else {
            start = moment.unix(event.start);
            end = moment.unix(event.end);
        }

        if (!moment().isSame(start, 'days')) {
            var
                exist = false,
                events = me.calendar.fullCalendar('clientEvents');
            $.each(events,
                function () {
                    var problem;
                    problem = true;
                    if (this.del) {
                        problem = true;
                    } else if (this.id === event.id) {
                        problem = true;
                    } else {
                        var
                            rangeOther = moment.range(this.start, this.end),
                            rangeMe = moment.range(start, end);
                        if (rangeOther.intersect(rangeMe)) {
                            exist = true;
                            problem = false;
                        }
                    }
                    return problem;
                }
            );
            return exist;
        }
        else {
            return false;
        }
    };

    Calendar.prototype.destroy = function () {
        this.calendar.fullCalendar('destroy');
        $("#external-events").find(".grid-content").find(" > div").empty();
        $("#reserve_types").empty();
    };

    Calendar.prototype.newCodMkt = function (cEO) {
        var me = this;
        bootbox.prompt("Qual o Codigo de Marketing?", function (result) {
            if (result === null || result.length < 4) {
                $.msg({
                    content: "Tem de colocar um novo codigo de marketing",
                    beforeUnblock: function () {
                        me.newCodMkt(cEO);
                    },
                    autoUnblock: true
                });
            } else {
                fnUpdateCodMKT(me, cEO, result);
            }
        });

        new AutoCompleteCodMkt($(".bootbox input"), true).init();
    };

    var aEventTypes = [];
    Calendar.prototype.fnSaveEventType = function (EventTypes) {
        aEventTypes = EventTypes;
    };

    Calendar.prototype.fnOpenModalService = function (calEvent) {
        var me = this,
            shModal = '\
        <table class="table table-striped table-bordered table-mod archives">\
            <thead>\
            <tr>\
            <th colspan="2">Escolha o novo tipo</th>\
            </tr>\
            </thead>\
            <tbody>' +
                (function () {
                    var htmlTR = "";

                    aEventTypes.forEach(function (oType) {
                        if (!oType.active || !(oType.sale || oType.useful))
                            return true;

                        htmlTR += '\
                    <tr>\
                        <td class="chex-table"><input type="radio" name="service-new-type" value="' + oType.id + '" id="service-new-type' + oType.id + '" data-text="' + oType.text + '" data-sale="' + oType.sale + '" data-useful="' + oType.useful + '"><label for="service-new-type' + oType.id + '"><span></span></label></td>\
                        <td><label for="service-new-type' + oType.id + '" class="btn-link">' + oType.text + '</label></td>\
                    </tr>';

                    });

                    return htmlTR;
                })()
                + '\
            </tbody>\
        </table>';

        bootbox.dialog(shModal, [
            {
                "label": "<i class='icon-trash'></i>",
                "class": "btn btn-danger left",
                "callback": fnDeleteEvent.bind(me, calEvent.id, me)
            },
            {
                "label": "Gravar Alterações",
                "class": "btn-success",
                "callback": function () {

                    var jqT = $("[name='service-new-type']:checked");

                    if (!jqT.val()) {
                        $.jGrowl("Seleccione um tipo de evento.");
                        return false;
                    }

                    $.msg();
                    $.post("/AM/ajax/calendar.php", {
                        action: "changeReservationType",
                        id: calEvent.id,
                        rtype: jqT.val()
                    }, function () {
                        var oData = jqT.data();

                        calEvent.title = calEvent.rsc_name + " " + oData.text;
                        calEvent.useful = oData.useful;
                        calEvent.sale = oData.sale;
                        calEvent.transformer = false;
                        calEvent.className = "t" + jqT.val();

                        me.calendar.fullCalendar('updateEvent', calEvent);

                        $.msg('unblock');
                    }, "json").fail(function () {
                        $.msg('replace', 'Ocorreu um erro, por favor verifique a sua ligação à internet e tente novamente.');
                        $.msg('unblock', 5000);
                    });
                }
            },
            {
                "label": "Cancelar",
                "class": "btn"
            }
        ]);

    };

    function fnMakeServiceCodMKT() {
        return "SERVICE" + moment().format("MMYY");
    }

    function fnUpdateCodMKT(me, cEO, sCodMKT) {
        $.post("ajax/client.php", {action: 'update_cod_mkt', codmkt: sCodMKT, id: cEO.lead_id}, function () {
            cEO.codCamp = sCodMKT;
            me.calendar.fullCalendar('updateEvent', cEO);
            if (me.client.box)
                me.client.box.refresh();
        });
    }

    return Calendar;
})();
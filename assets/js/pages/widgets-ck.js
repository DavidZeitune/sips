$(document).ready(function(){$("input, textarea").placeholder();$("textarea").autosize();$("#external-events div.external-event").each(function(){var e={title:$.trim($(this).text())};$(this).data("eventObject",e);$(this).draggable({zIndex:999,revert:!0,revertDuration:0})});var e=new Date,t=e.getDate(),n=e.getMonth(),r=e.getFullYear();$("#main_calendar_phone").fullCalendar({header:{left:"title",right:"prev,next"},defaultView:"agendaDay",editable:!0,events:[{title:"All Day Event",start:new Date(r,n,1)},{title:"Long Event",start:new Date(r,n,t-5),end:new Date(r,n,t-2)},{id:999,title:"Repeating Event",start:new Date(r,n,t-3,16,0),allDay:!1},{id:999,title:"Repeating Event",start:new Date(r,n,t+4,16,0),allDay:!1},{title:"Meeting",start:new Date(r,n,t,10,30),allDay:!1},{title:"Lunch",start:new Date(r,n,t,12,0),end:new Date(r,n,t,14,0),allDay:!1},{title:"Birthday Party",start:new Date(r,n,t+1,19,0),end:new Date(r,n,t+1,22,30),allDay:!1},{title:"Click for Google",start:new Date(r,n,28),end:new Date(r,n,29),url:"http://google.com/"}]})});
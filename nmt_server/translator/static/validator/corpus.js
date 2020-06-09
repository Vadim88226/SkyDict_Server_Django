var editor; // use a global for the submit and return data rendering in the examples

function ShowSelection(selectedText) {
    // selectedText = selectedText.trim();
    var sel = selectedText.split(' ');
    if (sel.length > 1 || selectedText.length == 0) { $(".dict_area").css('display', 'none'); return; }
    sel = sel[0].split(',');
    if (sel.length > 1) { $(".dict_area").css('display', 'none'); return; }
    selectedText = sel[0];

    $.ajax({
        // type: "POST",
        url: query_dict,
        data: {
            'seltext': selectedText,
            'sl': source_language.toLowerCase().substr(0, 2),
            'tl': target_language.toLowerCase().substr(0, 2)
        },
        dataType: 'json',
        success: function(data) {
            if ($('#id_searchWord').val() != selectedText) return;
            if (data != "") {
                $(".dict_area").css('display', 'flex');
                var dText = "";
                for (_dict in data.dictionary) {
                    if (data.dictionary[_dict]) {
                        dText += "<div><dictionary>" + _dict + "</dictionary><div class='content'>";
                        dText += data.dictionary[_dict] + "</div></div>";
                    }
                }
                dText = dText.replace(/\n/g, "<br>");
                dText = dText.replace(/  /g, "&nbsp; ");
                document.getElementById('translator_dict').innerHTML = dText;
                $(".dictionary_dict_area").css('display', 'block');

                dText = "";
                for (_s in data.sentences) {
                    if (data.sentences[_s]) {
                        dText += "<div><copus>" + _s + "</copus><div class='content'>";
                        dText += data.sentences[_s] + "</div></div>";
                    }
                }
                if (dText) {
                    document.getElementById('translator_sentences').innerHTML = dText;
                    $(".sentence_area").css('display', 'block');
                } else {
                    document.getElementById('translator_sentences').innerHTML = "";
                }
            } else {
                $(".dict_area").css('display', 'none');
                document.getElementById('translator_dict').innerHTML = "";
                document.getElementById('translator_sentences').innerHTML = "";
            }
        },
        error: function() {
            $(".dict_area").css('display', 'none');
        },
        timeout: 2000
    });
}

function view_template(_templateID) {
    document.getElementById("div_Corpus_file").innerHTML = "";
    var t = document.querySelector('#' + _templateID);

    var clone = document.importNode(t.content, true);
    document.getElementById("div_Corpus_file").appendChild(clone);
};

view_template("div_" + suburl + "_form");

$(function() {


    $(document).on('click', ".btn_new", function(e) {

        $.ajax({
            url: "/upload_CorpusFile/",
            type: "get",
            // data: {id: id},
            success: function(response) {
                view_template("corpusfile_new");
                var _form = document.createElement('form');
                console.log(response);
                _form.innerHTML = response;
                $("#cf_upload_form .file_url").html(_form.file_url);
                $("#cf_upload_form .name").html(_form.name);
                $("#cf_upload_form .s_lang").html(_form.s_lang);
                $("#cf_upload_form .t_lang").html(_form.t_lang);
                $("#cf_upload_form .note").html(_form.note);
            }
        })
    });
    $('.btn_search_form').on('click', function(e) {
        window.location = "/concordance/";
    });

    $("#corpus_file_table input[type='checkbox']").on('click', function(e) {
        if (this.value == 'on') {
            $("#corpus_file_table input[type='checkbox']").prop('checked', this.checked);
            if (this.checked) {
                $('#corpus_file_table > div > table > tbody > tr').css('background-color', 'lightgrey');
            } else {
                $('#corpus_file_table > div > table > tbody > tr').css('background-color', '');
            }
        }
    })
    $(document).on('click', ".btn_delete", function(e) {
        var form_data = new FormData(corpus_file_table);
        if ($("#corpus_file_table input[type='checkbox']").is(":checked")) {
            $.confirm({
                title: 'Delete Translation Memories',
                content: 'Are you sure you want to delete these translation memories?.',
                icon: 'fa fa-question-circle',
                animation: 'scale',
                closeAnimation: 'scale',
                opacity: 0.5,
                closeIcon: true,
                buttons: {
                    'confirm': {
                        text: 'Yes',
                        action: function() {
                            corpus_file_table.submit();
                        }
                    },
                    cancel: {
                        text: 'No'
                    },
                }
            });
        }
    });
    $('.spinner .btn:first-of-type').on('click', function() {
        if ($('.spinner input').val() == 100) {
            return false;
        } else {
            $('.spinner input').val(parseInt($('.spinner input').val() * 1, 10) + 1);
        }
    });

    $('.spinner .btn:last-of-type').on('click', function() {
        if ($('.spinner input').val() <= 1) {
            return false;
        } else {
            $('.spinner input').val(parseInt($('.spinner input').val() * 1, 10) - 1);
        }
    });
    $('#corpus_file_table > div > table > tbody > tr input[type="checkbox"]').on('click', function(e) {
        this.checked = 1 - this.checked;
    });
    $('#corpus_file_table > div > table > tbody > tr').on('click', function(e) {
        e.currentTarget.cells[5].childNodes[0].checked = 1 - (e.currentTarget.cells[5].childNodes[0].checked);
        if (e.currentTarget.cells[5].childNodes[0].checked)
            $(this).css('background-color', 'lightgrey');
        else
            $(this).css('background-color', '');
    });
    $(document).on('click', ".btn_uploadTm_back", function(e) {
        // $('.btn_memories_form').click();
        view_template("div_" + suburl + "_form");
    })
});

var precorpusfileUL = '';
var oldcorpusfileid = '';
var SentenceTable =  '';
var allpage = 0;
var currentpageno = 0;

var actions= [
	"Unchecked", 
	"Acceptable", 
	"Unacceptable", 
	"Amendable"
];



$(document).ready(function() {


    mytable = $('#corpusfilecontenttable').DataTable({
        data : [],
        columns : [
            { "data" : "id",  }, 
            { "data" : "count", "title" : "#"  },
            { "data" : "source", "title" : "Source", "className": "editable" ,   },
            { "data" : "target", "title" : "Target" , "className": "editable"   },
            { "data" : "status", "title" : "Status", 
                "render": function(d,t,r){
                    var $select = $("<select></select>", {
                        "id": r[0]+"start",
                        "value": d
                    });
                    $.each(actions, function(k,v){
                        var $option = $("<option></option>", {
                            "text": v,
                            "value": v
                        });
                        if(d === v){
                            $option.attr("selected", "selected")
                        }
                        $select.append($option);
                    });
                    return $select.prop("outerHTML");
                }
            }
        ],
        columnDefs: [{ 
            targets: '_all',
            "orderable": false 
            },
            {
                "targets": [ 0 ],
                "visible": false
            },
            { "width": "3%", "targets": 1 },
            { "width": "44%", "targets": 2 },
            { "width": "44%", "targets": 3 },
            { "width": "9%", "targets": 4 }
        ],
        select: {
            style:    'os',
            selector: 'td:first-child'
        },    
        "pageLength": 20,
        "aaSorting": [],
        "searching": false,
        // "pagingType": "simple",
        "bPaginate": false,
        "sPaginationType": "custom",
        "bLengthChange": false,
        "bInfo": false,
        // fixedColumns: true
    });

    $('body').on('dblclick', '#corpusfilecontenttable > tbody > tr >  td:not(:has(button))', function(){
        // The cell that has been clicked will be editable
        if($(this)[0].className != " editable")
            return;
        $(this).attr('contenteditable', 'true');
        var el = $(this);
        // The cell have now the focus
        el.focus();
        $(this).blur(endEdition);
    });

    function endEdition()
    {
        // get the cell 
        var el = $(this);
        const row = mytable.row(el)
        var id = row.data().id;
        var oldvalue = mytable.cell(el).data();
        var newvalue =  el.text();
        
        mytable.cell(el).data(newvalue).draw();
        // When the user finished to edit a cell and click out of the cell, the cell can't be editable, unless the user double click on this cell another time
        el.attr('contenteditable', 'false');
        el.off('blur', endEdition); // To prevent another bind to this function;
        //get the initialization options
        var columns = mytable.settings().init().columns;
        //get the index of the clicked cell
        var colIndex = mytable.cell(el).index().column;
        if(oldvalue != newvalue){
            send_changedsentence(id, columns[colIndex].data, newvalue, mytable.cell(el), oldvalue);
        }
        
    }
        
        
    $("#corpusfiles > ul ").on('click', function(e){
        
        var tagName = $(this)[0].tagName;
        if(precorpusfileUL != ''){
            $(precorpusfileUL)[0].className = '';
        }
        
        if( tagName == 'UL'){
            $(this)[0].className = 'selected';
            newcorpusfileid = $(this)[0].id;
            precorpusfileUL = this;
        }
        console.log(newcorpusfileid, oldcorpusfileid)
        if( newcorpusfileid != oldcorpusfileid && newcorpusfileid != undefined ){
            currentpageno = 1;
            get_CorpusfileSentence(newcorpusfileid, 1);
            oldcorpusfileid = newcorpusfileid;
            console.log('Sender posted');
        }
    });
  

    var get_CorpusfileSentence = function( id , pageno){
        $.ajax({
            url: '/get_corpussentence/',
            headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
            data: {
                'file_id': id,
                'page_id': pageno
            },
            dataType: 'json',
            type: "POST",
            success: function (response) {
                console.log(response);
                console.log(response.data.data );
                allpage = response.data.total;
                mytable.clear().rows.add(response.data.data).draw();
                console.log($("#corpusfilecontenttable_info"));
                $("#pageinfo").text( 'Showing ' + currentpageno + " page of  "  + allpage);
                if(currentpageno == 1){
                    mytable.columns.adjust().draw();
                }
                
            },
            error: function(response) {
                console.error(response)
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            },
            timeout: 2000
        });
        
    }
  
    $("#sentencetable_previous > a").on('click', function(){
        if(oldcorpusfileid == undefined){
            $.alert({
                title: 'Alert', content: 'Select Corpus File',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
        }
        if(currentpageno-1 > 0){
            get_CorpusfileSentence(oldcorpusfileid, currentpageno -- );
        }
         
    })
    $("#sentencetable_next > a").on('click', function(){
        if(oldcorpusfileid == undefined){
            return $.alert({
                title: 'Alert', content: 'Select Corpus File',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
        }
        if(currentpageno+1 < allpage){
            get_CorpusfileSentence(oldcorpusfileid, currentpageno ++ );
        }
        
    })
    
    function send_changedsentence(id, field, value, td, oldvalue ){
        var tk = $('#tokenid').attr("data-token");
        $.ajax({
            url: "/update_corpussentence/",
            type: "POST",
            data: {
                'field': id,
                'id': field,
                'value': value,
                'csrfmiddlewaretoken': tk
            },
            success: function(response) {
                
                console.log(response);
            },
            error: function(response) {
                console.error(response)
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
                td.data(oldvalue).draw();
            },
            timeout: 2000

        })
    }
        
    
});


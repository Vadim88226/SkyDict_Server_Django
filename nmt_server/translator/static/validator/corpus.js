
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
                _form.innerHTML = response;
                $("#cf_upload_form .file_url").html(_form.file_url);
                $("#cf_upload_form .name").html(_form.name);
                $("#cf_upload_form .s_lang").html(_form.s_lang);
                $("#cf_upload_form .t_lang").html(_form.t_lang);
                $("#cf_upload_form .linguist").html(_form.linguist);
                $("#cf_upload_form .note").html(_form.note);
            }
        })
    });
    $(document).on('click', "#corpus_file_table input[type='checkbox']", function(e) {
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
        if ($("#corpus_file_table input[type='checkbox']").is(":checked")) {
            $.confirm({
                title: 'Delete Translation Memories',
                content: 'Are you sure you want to delete these Bilingual Corpus Files?.',
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
    $(document).on('click', '#corpus_file_table > div > table > tbody > tr input[type="checkbox"]', function(e) {
        this.checked = 1 - this.checked;
    });

    
    $(document).on('click','#corpus_file_table > div > table > tbody > tr', function(e) {
        if(e.target.className != 'export_btn' && e.target.className != 'fas' ){
            e.currentTarget.cells[5].childNodes[0].checked = 1 - (e.currentTarget.cells[5].childNodes[0].checked);
            if (e.currentTarget.cells[5].childNodes[0].checked)
                $(this).css('background-color', 'lightgrey');
            else
                $(this).css('background-color', '');
        }
        
    });
    $(document).on('click', ".btn_uploadTm_back", function(e) {
        // $('.btn_memories_form').click();
        view_template("div_" + suburl + "_form");
    })

    // corpusfile export 
    $(document).on('click', ".export_btn", function(e) {
        e.preventDefault();
        $("#new_name").val('')
        var row = $(this).parent().parent()[0].children;
        var f_name = $(row[1]).text();
        var f_url = $(row[3]).text();
        var f_id = $(row[5].firstChild).val();
        var f_typue = f_url.split('.');
        if(f_url.length > 25){
            var f_url_ = f_url.slice(0, 25) + "...";
        }else{
            var f_url_ = f_url;
        }
        
        $("#ex_name").html(f_name);
        $("#ex_url").html(f_url_);
        $("#ex_id").val(f_id);
        $("#export_modal").modal();
        setTimeout(() => {
            $("#new_name").focus();
        }, 1000);
       
    })
    
    var export_corpusfn = function(datas){
        $.ajax({
            url: "/export_bilingualcorpus/",
            headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
            type: "POST",
            data: {
                'id': datas['ex_id'],
                'name': datas['new_name'],
                'type': datas['ex_type'],
                'statuses': datas['status'],

            },
            dataType: 'json',
            success: function(response) {
                if (response.valid) {
                    
                    fileUrl = "../static/media/" + response.file_path;
                    var file = new File(["aa"], fileUrl);
                    var link = document.createElement("a");
                    link.download = file.name;
                    link.href = fileUrl;
                    link.click();
                    $("#export_modal").modal('hide');
                    $.alert({
                        title: 'Alert', content: 'SUCCESSFUL',
                        icon: 'fa fa-smile-o', theme: 'modern', animation: 'scale', closeAnimation: 'scale',
                        type: 'blue',
                        autoClose: 'okay|2000',
                        buttons: {
                            okay: {  }
                        }
                    });
                    $('#export_setting_form').not(':button, :submit, :reset, :hidden').val('').removeAttr('checked').removeAttr('selected');
                }else{
                    $.alert({
                        title: 'Alert', content: response.error,
                        icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                        buttons: {
                            yes: {  }
                        }
                    });
                }
               
            },
            error: function(response) {
           
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            },
            timeout: 2000

        })
    }

    $(document).on('click', '.btn.btn-default.btn-setting-export', function(){
        params   = $('#export_setting_form').serializeArray();
        if(params[3].value == ''){
            $("#new_name").focus()
            return false;
        }

        
        var parramsarray = Array();
        var statusary = Array();
        for (const key in params) {
            if (key > 4 && params.hasOwnProperty(key)) {
                const element = params[key];
                statusary.push(element.name);
            }else{
                const element = params[key];
                parramsarray[element.name]=element.value;
            }
        }
        if(statusary.length){
           
            parramsarray['status']=statusary.join(',');
            export_corpusfn(parramsarray); 
        }else{
            $('#status2')[0].checked =  true;
        }
      
    });



});

// edittable 
$(document).ready(function() {
    
    var presentencetr = 0; // pre "row or <tr>" of row that user click in sentence table
    var presentencecss = ''; // pre "Backbround-color" of row that user click in sentence table
    var currentpageno = 1;
    var allpage = 0;
    var SentenceTable =  '';
    var precorpusfileUL = '';
    var oldcorpusfileid = '';
    var status = Array();
    var iconary = Array('ok', 'remove','pencil');
    SentenceTable = $('#corpusfilecontenttable').DataTable({
        data : [],
        columns : [
            { "data" : "id",  }, 
            { "data" : "count", "title" : "#"  },
            { "data" : "source", "title" : "Source", "className": '' ,   },
            { "data" : "target", "title" : "Target" , "className": "editable"   },
            { "data" : "status", "title" : "Status", 
                "render": function(d,t,r){
                    var $buttons = $("<kmc></kmc>", {
                        "id": r['id']+"_select",
                        "value": d
                    });
                    var $bun =  '';
                    
                    for (let o = 0; o < iconary.length; o++) {
                        const ele = iconary[o];
                        if( status[o] == d ){
                            $bun = $bun + "<span class='glyphicon glyphicon-" + ele +" status_icons selected' id='" + status[o] + "' accessKey='"+ o +"' ></span>";
                        }else{
                            $bun = $bun + "<span class='glyphicon glyphicon-" + ele +" status_icons' id='" + status[o] + "' accessKey='"+ o +"' ></span>";
                        }
                        
                    }

                    $buttons.append($bun);
                    return $bun;
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
            { "width": "4%", "targets": 1, "className": "text-center", },
            { "width": "43%", "targets": 2 , "className": "text-left",},
            { "width": "43", "targets": 3 , "className": "text-left",},
            { "width": "10%", "targets": 4 , "className": "text-center",}
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
        fixedColumns: true
    });

    $('body').on('dblclick', '#corpusfilecontenttable > tbody > tr >  td:not(:has(button))', function(){
        // The cell that has been clicked will be editable
        if($(this)[0].className != " editable")
            return;
        if(SentenceTable.row($(this)).data().status != "Amendable")
            return;
        
        var el = $(this);
        $(this).attr('contenteditable', 'true');
        // The cell have now the focus
        el.focus();
        $(this).blur(endEdition);
    });
    
    $(document).on('click','#corpusfilecontenttable > tbody > tr', function(e) {
        e.preventDefault();
        // please check pre selected row or <tr>
        if(presentencetr)
            $(presentencetr)[0].style.backgroundColor = presentencecss;
            presentencetr = this;
            presentencecss = $(this)[0].style.backgroundColor;

        $(this).css('background-color', 'lightgrey');
       
    });
    
    $(document).keydown(function (e) {

        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
          $(presentencetr)[0].children[3].children[0].click()
          e.preventDefault()
        }
    });

    
    // page no input box
    $('body').on('change', '#pageno', function(){
        var newpageno = $(this).val();
        if(!oldcorpusfileid){
            $(this).val('');
            return;
        } 
        if(newpageno > allpage){
            newpageno = allpage;
            $(this).val(allpage);
        }
        if(newpageno < 1){
            newpageno = 1;
            $(this).val(1);
        }
        currentpageno = newpageno;
        get_CorpusfileSentence(oldcorpusfileid, newpageno)
    });

    function endEdition()
    {
        // get the cell 
        var el = $(this);
        const row = SentenceTable.row(el)
        var id = row.data().id;
        var oldvalue = SentenceTable.cell(el).data();
        var newvalue =  el.text();
        
        SentenceTable.cell(el).data(newvalue).draw();
        // When the user finished to edit a cell and click out of the cell, the cell can't be editable, unless the user double click on this cell another time
        el.attr('contenteditable', 'false');
        el.off('blur', endEdition); // To prevent another bind to this function;
        //get the initialization options
        var columns = SentenceTable.settings().init().columns;
        //get the index of the clicked cell
        var colIndex = SentenceTable.cell(el).index().column;
        if(oldvalue != newvalue){
            send_changedsentence(id, columns[colIndex].data, newvalue, SentenceTable.cell(el), oldvalue);
        }
        
    }
    $(document).on('click', '#corpusfilecontenttable > tbody > tr > td > span.status_icons ', function(e){
        var el = $(this).parent();
        var child_list = el[0].children;
        for( var i = 0; i< 3 ; i ++ ){
           const icon = child_list[ i ];
           icon.className = icon.className.replace('selected', '');
        }
        $(this)[0].className = $(this)[0].className + " selected";
        var row = SentenceTable.row(el);
        var id = row.data().id;
        var oldvalue = SentenceTable.cell(el).data();
        var newvalue = $(this)[0].id;
        // please send changed sentence by user in biligualcorpusfile sentence table...
        send_changedsentence(id, 'status', newvalue, SentenceTable.cell(el), oldvalue);
    });
    // when corpusfile list click, event
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
        if( newcorpusfileid != oldcorpusfileid && newcorpusfileid != undefined ){
            currentpageno = 1; // set default 1 
            get_CorpusfileSentence(newcorpusfileid, 1);
            oldcorpusfileid = newcorpusfileid;
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
                allpage = response.data.total_pages;
                status = response.data.status;
                SentenceTable.clear().rows.add(response.data.data).draw();
                $('#pageno').val(pageno);
                $('#allpagenumber').text(allpage) 
                if(pageno == 1){
                    SentenceTable.columns.adjust().draw();
                }
                
            },
            error: function(response) {
           
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

        if(oldcorpusfileid == undefined || oldcorpusfileid == ''){
            $.alert({
                title: 'Alert', content: 'Select Corpus File',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
            return;
        }
        if(currentpageno > 1){
            get_CorpusfileSentence(oldcorpusfileid, --currentpageno);
        }
         
    })
    $("#sentencetable_next > a").on('click', function(){
        if(oldcorpusfileid == undefined || oldcorpusfileid == ''){
            return $.alert({
                title: 'Alert', content: 'Select Corpus File',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
            return;
        }
        if(currentpageno < allpage){
            get_CorpusfileSentence(oldcorpusfileid, ++currentpageno);
        }
        
    })
    
    function send_changedsentence(id, field, value, td, oldvalue){
        var tk = $('#tokenid').attr("data-token");
        $.ajax({
            url: "/update_corpussentence/",
            type: "POST",
            data: {
                'id': id,
                'field': field,
                'value': value,
                'csrfmiddlewaretoken': tk
            },
            success: function(response) {
                td.data(value).draw();
            },
            error: function(response) {
          
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


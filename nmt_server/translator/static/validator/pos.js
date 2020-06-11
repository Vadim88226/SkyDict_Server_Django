
function view_template(_templateID) {
    document.getElementById("div_Postagged_file").innerHTML = "";
    var t = document.querySelector('#' + _templateID);

    var clone = document.importNode(t.content, true);
    document.getElementById("div_Postagged_file").appendChild(clone);
};

view_template("div_" + suburl + "_form");

$(function() {


    $(document).on('click', ".btn_new", function(e) {

        $.ajax({
            url: "/upload_POSTaggedFile/",
            type: "get",
            // data: {id: id},
            success: function(response) {
                view_template("postagged_new");
                var _form = document.createElement('form');
                _form.innerHTML = response;
                $("#pf_upload_form .file_url").html(_form.file_url);
                $("#pf_upload_form .name").html(_form.name);
                $("#pf_upload_form .s_lang").html(_form.s_lang);
                $("#pf_upload_form .t_lang").html(_form.t_lang);
                $("#pf_upload_form .note").html(_form.note);
            }
        })
    });
    $(document).on('click', "#postagged_table input[type='checkbox']", function(e) {
        if (this.value == 'on') {
            $("#postagged_table input[type='checkbox']").prop('checked', this.checked);
            if (this.checked) {
                $('#postagged_table > div > table > tbody > tr').css('background-color', 'lightgrey');
            } else {
                $('#postagged_table > div > table > tbody > tr').css('background-color', '');
            }
        }
    })
    $(document).on('click', ".btn_delete", function(e) {
        if ($("#postagged_table input[type='checkbox']").is(":checked")) {
            $.confirm({
                title: 'Delete Translation Memories',
                content: 'Are you sure you want to delete these POS Tagged Files?.',
                icon: 'fa fa-question-circle',
                animation: 'scale',
                closeAnimation: 'scale',
                opacity: 0.5,
                closeIcon: true,
                buttons: {
                    'confirm': {
                        text: 'Yes',
                        action: function() {
                            postagged_table.submit();
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
    $(document).on('click', '#postagged_table > div > table > tbody > tr input[type="checkbox"]', function(e) {
        this.checked = 1 - this.checked;
    });

    
    $(document).on('click','#postagged_table > div > table > tbody > tr', function(e) {
        if(e.target.className != 'export_btn' && e.target.className != 'fas' ){
            e.currentTarget.cells[4].childNodes[0].checked = 1 - (e.currentTarget.cells[4].childNodes[0].checked);
            if (e.currentTarget.cells[4].childNodes[0].checked)
                $(this).css('background-color', 'lightgrey');
            else
                $(this).css('background-color', '');
        }
        
    });
    $(document).on('click', ".btn_uploadTm_back", function(e) {
        // $('.btn_memories_form').click();
        view_template("div_" + suburl + "_form");
    })

    // postagged file export 
    $(document).on('click', ".export_btn", function(e) {
        e.preventDefault();
        $("#new_name").val('')
        var row = $(this).parent().parent()[0].children;
        var f_name = $(row[1]).text();
        var f_url = $(row[3]).text();
        var f_id = $(row[4].firstChild).val();
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
    
    var export_potaggedfn = function(datas){
        $.ajax({
            url: "/export_postagged/",
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
                    
                    fileUrl = "../static/media/" + response.url;
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
            parramsarray['status']=statusary.join(',');console.log(parramsarray);
            export_potaggedfn(parramsarray);
        }else{
            $('#status2')[0].checked =  true;
        }
      
    });



});



// edittable 
$(document).ready(function() {

    var currentpageno = 1;
    var allpage = 0;
    var SentenceTable =  '';
    var prepostaggedsUL = '';
    var oldpostaggedsid = '';
    var status = Array();
    SentenceTable = $('#postaggedcontenttable').DataTable({
        data : [],
        columns : [
            { "data" : "id",  }, 
            { "data" : "count", "title" : "#"  },
            { "data" : "source", "title" : "Source", "className": "editable" ,   },
            { "data" : "target", "title" : "Target" , "className": "editable"   },
            { "data" : "status", "title" : "Status", 
                "render": function(d,t,r){
                    var $select = $("<select></select>", {
                        "id": r['id']+"_select",
                        "value": d
                    });
                    $.each(status, function(k,v){
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
            { "width": "3%", "targets": 1, "className": "text-center", },
            { "width": "44%", "targets": 2 , "className": "text-left",},
            { "width": "44%", "targets": 3 , "className": "text-left",},
            { "width": "9%", "targets": 4 , "className": "text-center",}
        ],
        select: {
            style:    'os',
            selector: 'td:first-child'
        },    
        "pageLength": 10,
        "aaSorting": [],
        "searching": false,
        // "pagingType": "simple",
        "bPaginate": false,
        "sPaginationType": "custom",
        "bLengthChange": false,
        "bInfo": false,
        fixedColumns: true
    });

    $('body').on('dblclick', '#postaggedcontenttable > tbody > tr >  td:not(:has(button))', function(){
        // The cell that has been clicked will be editable
        if($(this)[0].className != " editable")
            return;
        $(this).attr('contenteditable', 'true');
        var el = $(this);
        // The cell have now the focus
        el.focus();
        $(this).blur(endEdition);
    });
    // page no input box
    $('body').on('change', '#pageno', function(){
        var newpageno = $(this).val();
        if(!oldpostaggedsid){
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
        get_POSTaggedSentence(oldpostaggedsid, newpageno)
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

    // change status event
    $('body').on('change', '#postaggedcontenttable > tbody > tr > td > select', function(){
        var el = $(this).parent();
        var row = SentenceTable.row(el);
        var id = row.data().id;
        var oldvalue = SentenceTable.cell(el).data();
        var newvalue = $(this).val();
        send_changedsentence(id, 'status', newvalue, SentenceTable.cell(el), oldvalue);
    })
    // when postaggeds list click, event
    $("#postaggeds > ul ").on('click', function(e){
        
        var tagName = $(this)[0].tagName;
        if(prepostaggedsUL != ''){
            $(prepostaggedsUL)[0].className = '';
        }
        
        if( tagName == 'UL'){
            $(this)[0].className = 'selected';
            newpostaggedsid = $(this)[0].id;
            prepostaggedsUL = this;
        }
        if( newpostaggedsid != oldpostaggedsid && newpostaggedsid != undefined ){
            currentpageno = 1; // set default 1 
            get_POSTaggedSentence(newpostaggedsid, 1);
            oldpostaggedsid = newpostaggedsid;
        }
    });
  

    var get_POSTaggedSentence = function( id , pageno){

        $.ajax({
            url: '/get_postaggedsentence/',
            headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
            data: {
                'file_id': id,
                'page_id': pageno
            },
            dataType: 'json',
            type: "POST",
            success: function (response) {
                console.log(response);
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

        if(oldpostaggedsid == undefined || oldpostaggedsid == ''){
            $.alert({
                title: 'Alert', content: 'Select POS Tagged File',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
            return;
        }
        if(currentpageno > 1){
            get_POSTaggedSentence(oldpostaggedsid, --currentpageno);
        }
         
    })
    $("#sentencetable_next > a").on('click', function(){
        if(oldpostaggedsid == undefined || oldpostaggedsid == ''){
            return $.alert({
                title: 'Alert', content: 'Select POS Tagged File',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
            return;
        }
        if(currentpageno < allpage){
            get_POSTaggedSentence(oldpostaggedsid, ++currentpageno);
        }
        
    })
    
    function send_changedsentence(id, field, value, td, oldvalue){
        var tk = $('#tokenid').attr("data-token");
        $.ajax({
            url: "/update_postaggedsentence/",
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
    // POS Tagged event
    var presentencetr = 0;
    var presentencecss = '';
    // current selected sentence data = Ceed
    var Ceed = Array();
    var CeedPOSdata = Array();

    $(document).on('click','#postaggedcontenttable > tbody > tr', function(e) {
        if(presentencetr)
            $(presentencetr)[0].style.backgroundColor = presentencecss;
            presentencetr = this;
            presentencecss = $(this)[0].style.backgroundColor;

        $(this).css('background-color', 'lightgrey');
        
        var rowdata = SentenceTable.row($(this)).data();
        Ceed = rowdata;
        $('#pos_id').val(Ceed.id);
        $('#pos_count').val(Ceed.count);
        $('#pos_corpusid').val(oldpostaggedsid);

        $('#pos_source').val(Ceed.source);
        $('#pos_target').val(Ceed.target);
        $('#pos_status').val(Ceed.status);
        e.preventDefault();
    });



    var grid_POSTaggedsentence = function(source, target){
        var source_tags = ''
        for(var i = 0; i < source.length; i ++ ){
            source_tags = source_tags + "<span class='taggedWord tag" + source[i].pos + "'>" + source[i].word + "</span>";
        }
        var target_tags = ''
        for(var i = 0; i < target.length; i ++ ){
            target_tags = target_tags + "<span class='taggedWord tag" + target[i].pos + "'>" + target[i].word + "</span>";
        }
       
        $('#pos_source').hide();
        $('#pos_target').hide();
        $('#source_Tagged').html(source_tags);
        $('#target_Tagged').html(target_tags);
        $('#source_Tagged').show();
        $('#target_Tagged').show();
       
    }
    $(document).on('click', '#tagger', function(){
        
        if(Ceed.length)return;

        $(this)[0].disabled = true;
        $('#editer')[0].disabled = false;
        var tk_ = $('#tokenid').attr("data-token");
        var source_ = $('#pos_source').val();
        var target_ = $('#pos_target').val();
        $.ajax({
            url: "/tag_sentence/",
            type: "POST",
            data: {
                'source': source_,
                'target': target_,
                'csrfmiddlewaretoken': tk_
            },
            success: function(response) {
                
                console.log(response)
                if(response.valid){
                    CeedPOSdata = response;
                    grid_POSTaggedsentence(response.source, response.target);
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
    });

    $(document).on('click', '#editer', function(){
        $('#source_Tagged').hide();
        $('#target_Tagged').hide();
        $('#pos_source').show();
        $('#pos_target').show();
        $(this)[0].disabled = true;
        $('#tagger')[0].disabled = false;
    });

    $(document).on('click', '#saver', function(){
      console.log('HI, I am saver, Nice to meet you.')
    });

    var tagMap = Array();
    $(document).on('click mouseover','.taggedWord', function(ev) {
        var word = $(ev.target);
        var tagName = word[0].classList[1];

        // console.log(word[0].classList[1], tagName, tagInfo);

        // if (tagName == "" || tagMap[tagName] == undefined) {
        //     return; // cancel if tag not defined
        // }
        
        $('#tagTipContainer').show();

        // if (tagInfo[0] != "" ) {
        //     var posName ='' //appData.i18n[tagInfo[0]] !== undefined ? appData.i18n[tagInfo[0]] : tagInfo[0];
        //     var tagDescription = tagInfo[1];
        //     var tagExamples = tagInfo[2];
        //     var infoHtml = '<b>' + posName + '</b>, ' + tagName;
        //     if (tagDescription != '') {
        //         infoHtml += '<br />(' + tagDescription + ')';
        //     }
        //     if (tagExamples != '') {
        //         infoHtml += "<br />" + appData.i18n['label_examples'] + " " + tagExamples;
        //     }
        //     $('#tagTip').html(infoHtml);
        // }else {
        $('#tagTip').html(tagName + ': ');
        // }
        // var pos = posAvailable.indexOf(tagInfo[0]) === -1 ? 'Other' : tagInfo[0];
        // $('#tagTipContainer').removeClass();
        // $('#tagTipContainer').addClass('tag' + pos);
        // $('#tagTipContainer').offset({'left': word.offset().left});
        // $('#tagTipContainer').offset({'top': word.offset().top + word.outerHeight()});
        // $('#tagTipContainer .up').offset({'left': word.offset().left + word.outerWidth() / 2 - $('#tagTipContainer .up').outerWidth() / 2});
    });
    $('.taggedWord').bind('mouseout', function(ev) {
        $('#tagTipContainer').hide();
    });
  
});



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
            parramsarray['status']=statusary.join(',');
            export_potaggedfn(parramsarray);
        }else{
            $('#status2')[0].checked =  true;
        }
      
    });



});



// edittable 
$(document).ready(function() {

    var currentpageno = 1; // this is value of current page.
    var allpage = 0; // this is value of all page number of current selected file..
    var SentenceTable =  ''; // please define sentence table of corpusfile
    var prepostaggedsUL = ''; // this value is <UL> tag $(this) selected from corpusfile list 
    var oldpostaggedsid = ''; // this value is server id of corpus file list
    var status = Array(); // this is array to save status of sentence 
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
        "pageLength": 10, // page showed length
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
        // please first page data of new corpusfile selected by user in corpusfile list..
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
            // please send changed sentence by user in biligualcorpusfile sentence table...
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
        // please send changed sentence by user in biligualcorpusfile sentence table...
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
            // please first page data of new corpusfile selected by user in corpusfile list..
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
                allpage = response.data.total_pages;
                status = response.data.status;
                // please cleat data of table loaded, and add new page data..
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
            // please get sentence of current page in POStagged corpusfile, from server...
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
            // please get sentence of current page in POStagged corpusfile, from server...
            get_POSTaggedSentence(oldpostaggedsid, ++currentpageno);
        }
        
    })
    // pleae send data of sentence changed by user to server.
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

                if(field != 'status' && response['tagged_'+field].length > 0){
                    grid_POSTaggedsentenceONE(response['tagged_'+field], field);
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
                // if server error, go back row or changed data.
                td.data(oldvalue).draw();
            },
            timeout: 2000

        })
    }
    // POS Tagged event
    var presentencetr = 0; // pre "row or <tr>" of row that user click in sentence table
    var presentencecss = ''; // pre "Backbround-color" of row that user click in sentence table
    var Ceed = Array();// current selected sentence data array in postaggedcorpusfilesentence table = Ceed
    var CeedPOSdata = Array(); // POS tagged data array of Ceed ( current selected sentence data)
    var CWinST_ary = Array();  // array of Ckick Word in tagged Source and Tagged target div
    var  EN_TAGS = [
                    {'L':'ADJ', 'R':'Adjective'},
                    {'L':'ADP', 'R':'Adposition'},
                    {'L':'ADV', 'R':'Adverb'},
                    {'L':'AUX', 'R':'Auxiliary'},
                    {'L':'CCONJ', 'R':'Coordinating conjunction'},
                    {'L':'DET', 'R':'Determiner'},
                    {'L':'INTJ', 'R':'Interjection'},
                    {'L':'NOUN', 'R':'Noun'},
                    {'L':'NUM', 'R':'Numeral'},
                    {'L':'PART', 'R':'Particle'},
                    {'L':'PRON', 'R':'Pronoun'},
                    {'L':'PROPN', 'R':'Proper noun'},
                    {'L':'PUNCT', 'R':'Punctuation'},
                    {'L':'SCONJ', 'R':'Subordinating conjunction'},
                    {'L':'VERB', 'R':'Verb'},
                    {'L':'OTH', 'R':'Other'}
                ]; // Long and short Maps data array of every Tags
    
    var __tag_str__1 = ""; 
    var __tag_str__2 = "";
    var on = 0;
    EN_TAGS.forEach(_tag_ => {
        if(_tag_['L'] == 'NUM'){
            on = 1;
        }
        if( on == '0' ){
            __tag_str__1 = __tag_str__1 +  "<div class='tag" + _tag_['L'] + "'>" + _tag_['R'] + "</div>";
        }else{
            __tag_str__2 = __tag_str__2 +  "<div class='tag" + _tag_['L'] + "'>" + _tag_['R'] + "</div>";
        }
        
    });
    $('#colors1').html(__tag_str__1); // please show tags of color 1
    $('#colors2').html(__tag_str__2); // please show tags of color 2
                
    $(document).on('click','#postaggedcontenttable > tbody > tr', function(e) {
        e.preventDefault();
        // please check pre selected row or <tr>
        if(presentencetr)
            $(presentencetr)[0].style.backgroundColor = presentencecss;
            presentencetr = this;
            presentencecss = $(this)[0].style.backgroundColor;

        $(this).css('background-color', 'lightgrey');
        
        var rowdata = SentenceTable.row($(this)).data(); // this is data of current selected row or <tr>
        Ceed = rowdata; // please save and use data of row when user click row of postaggedcorpusfile table.
        $('#pos_id').val(Ceed.id);
        $('#pos_count').val(Ceed.count);
        $('#pos_corpusid').val(oldpostaggedsid);

        $('#pos_source').val(Ceed.source);
        $('#pos_target').val(Ceed.target);
        $('#pos_status').val(Ceed.status);
        tag_sentencefn('false'); // please tag current selected sentence.
       
    });


    var grid_POSTaggedsentenceONE = function(tagged_data, data_id){
        var tags_str = '';
        var sentence_str = '';
        for(var i = 0; i < tagged_data.length; i ++ ){

            tags_str = tags_str + "<span class='taggedWord tag" + tagged_data[i].pos + "'>" + tagged_data[i].token + "</span>";
            if (sentence_str == ''){
                sentence_str = tagged_data[i].token;
            }
            else{
                sentence_str = sentence_str + ' ' + tagged_data[i].token;
            }

        }
        
        $('#pos_'+data_id).val(sentence_str);
        $('#'+ data_id +'_Tagged').html(tags_str);

    }
    var grid_POSTaggedsentenceALL = function(source, target){
        var source_tags = '';
        var source_sentence = '';
        for(var i = 0; i < source.length; i ++ ){

            source_tags = source_tags + "<span class='taggedWord tag" + source[i].pos + "'>" + source[i].token + "</span>";
            if (source_sentence == ''){
                source_sentence = source[i].token;
            }
            else{
                source_sentence = source_sentence + ' ' + source[i].token;
            }


        }
        var target_tags = '';
        var target_sentence = '';
        for(var i = 0; i < target.length; i ++ ){

            target_tags = target_tags + "<span class='taggedWord tag" + target[i].pos + "'>" + target[i].token + "</span>";
            if(target_sentence==''){
                target_sentence = target[i].token;
            }
            else{
                target_sentence = target_sentence + " " + target[i].token ;
            }

        }
        
        $('#pos_source').val(source_sentence);
        $('#pos_target').val(target_sentence);
        $('#pos_source').hide();
        $('#pos_target').hide();
        $('#source_Tagged').html(source_tags);
        $('#target_Tagged').html(target_tags);
        $('#source_Tagged').show();
        $('#target_Tagged').show();
        $('#editer')[0].disabled = false;
        $('#tagger')[0].disabled = true;
        $('#saver')[0].disabled = false;
        $('#editer').show();
        $('#tagger').hide();
       
    };
    // this function is to save tagged sentence by user.
    var save_taggedsentencefn = function(Taggerid, tagged_source, tagged_target){
        var tk_ = $('#tokenid').attr("data-token");
        $.ajax({
            url: "/save_postaggedsentence/",
            type: "POST",
            data: {
                'id' : Taggerid,
                'tagged_source': tagged_source,
                'tagged_target': tagged_target,
                'csrfmiddlewaretoken': tk_
            },
            success: function(response) {
                if(response.valid){
                    $.alert({
                        title: 'Alert', content: 'SUCCESSFUL',
                        icon: 'fa fa-smile-o', theme: 'modern', animation: 'scale', closeAnimation: 'scale',
                        type: 'blue',
                        autoClose: 'okay|1000',
                        buttons: {
                            okay: {  }
                        }
                    });
                }else{
                    $.alert({
                        title: 'Alert', content: response.error,
                        icon: 'fa fa-smile-o', theme: 'modern', animation: 'scale', closeAnimation: 'scale',
                        type: 'blue',
                        buttons: {
                            okay: {  }
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

        });
    }
    // this is function to tag selected sentence.
    var tag_sentencefn = function(Tagged_status_) {
        var tk_ = $('#tokenid').attr("data-token");
        var source_ = $('#pos_source').val();
        var target_ = $('#pos_target').val();
        // var Tagged_status_ = $('#Tagged_status').val();
        $.ajax({
            url: "/tag_sentence/",
            type: "POST",
            data: {
                'id' : Ceed.id,
                'source': source_,
                'target': target_,
                'keep_tokens': Tagged_status_,
                'csrfmiddlewaretoken': tk_
            },
            success: function(response) {
                
                if(response.valid){
                    // please save in pos tagged data (CeedPOSdata) from response of server
                    CeedPOSdata = response;
                    grid_POSTaggedsentenceALL(response.tagged_source, response.tagged_target);

                }
            },
            error: function(response) {
                console.error(response);
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
    $(document).on('click', '#tagger', function(){

        // please check if sentence data is and not.
        if(Ceed.length == 0 ){
            return;
        }
        $(this)[0].disabled = true;
        $(this).hide();
        $('#editer')[0].disabled = false;
        $('#saver')[0].disabled = false;
        $('#saver').show();
        $('#editer').show()
        tag_sentencefn('true');
    });

    $(document).on('click', '#editer', function(){
        $('#source_Tagged').hide();
        $('#target_Tagged').hide();
        $('#pos_source').show();
        $('#pos_target').show();
        $(this)[0].disabled = true;
        $(this).hide();
        $('#tagger')[0].disabled = false;
        $('#saver')[0].disabled = true;
        $('#tagger').show();
        $('#saver').show();
    });

    $(document).on('click', '#saver', function(){
        // please check if sentence data is and not.
        if( Ceed.length == 0 || $('#tagger')[0].disabled == false ){
            $('#tagger').click();
            return false;
        }
        var source_spans = $('#source_Tagged').children();
        var target_spans = $('#target_Tagged').children();
        var Tsource_data = [];
        var Ttarget_data = [];
        var _get_attr = function (_id) {
            var _tag = $(_id).attr('class').replace('taggedWord tag', '');
            var _word = $(_id).text();
            var _token_tag_ = {'token' : _word, 'pos' : _tag} 
            return _token_tag_;
        }
        
        for (const Sspan of source_spans) {
            Tsource_data.push(_get_attr(Sspan));
        }
        for (const Tspan of target_spans) {
            Ttarget_data.push(_get_attr(Tspan));
        }
        //please parse json format
        var _Tsource_data = JSON.stringify(Tsource_data);
        var _Ttarget_data = JSON.stringify(Ttarget_data);
        // please save tagged sentence by user.
        save_taggedsentencefn(Ceed.id, _Tsource_data,_Ttarget_data);
    });

    // this is Listener when user ckick basic tags of tag memu(one only of all tags)
    $(document).on('mouseover','.taggedWord', function(ev) {
        var word = $(ev.target);
        var tagName = word[0].classList[1];
        
        $('#tagTipContainer').show();
        if(EN_TAGS.filter( TAG => TAG['L'] ==  tagName.replace('tag', '')).length > 0){
            $('#tagTip').html(EN_TAGS.filter( TAG => TAG['L'] ==  tagName.replace('tag', ''))[0]['R']);
        }else{
            $('#tagTip').html('Other')
        }
        $('#tagTipContainer').removeClass();
        $('#tagTipContainer').addClass(tagName);
        $('#tagTipContainer').offset({'left': word.offset().left});
        $('#tagTipContainer').offset({'top': word.offset().top + word.outerHeight()});
        $('#tagTipContainer .up').offset({'left': word.offset().left + word.outerWidth() / 2 - $('#tagTipContainer .up').outerWidth() / 2});
    });
    $(document).bind('mouseout', '.taggedWord', function(ev) {
        $('#tagTipContainer').hide();
    });
    $(window).bind('resize', function() { $('#tagTipContainer').hide(); });
    $('#tagTipContainer').bind('click', function() { $('#tagTipContainer').hide(); });
    

    var clear_tag_colorfn = function(new_tag){
        CWinST_ary.forEach(span_word => {
            if(new_tag != 'old'){
                $(span_word)[0].className = "taggedWord " + new_tag;
            }else{
                $(span_word).css('outline', 'none');
            }
            
        });

    }
    $(document).on('click, mousedown','.colors > div', function(e) {
        var new_tag = $(this)[0].className;
        $(this).css('background-color', 'aliceblue');
        clear_tag_colorfn(new_tag);
        setTimeout(() => {
            $(this).css('background-color', '');
        }, 100);
    });
    $(document).on('mouseup','.colors > div', function(e) {
        $(this).css('background-color', '');
    });

    
    $(document).on('click, mousedown','.taggedWord', function(e) {

        if (!e.ctrlKey) { 
            clear_tag_colorfn('old');
            CWinST_ary = new Array();
        }

        if($(this)[0].style.cssText == 'outline: -webkit-focus-ring-color auto 1px;'){
            $(this).css('outline', '-webkit-focus-ring-color none 0px');
            CWinST_ary = CWinST_ary.filter(___word__ => ___word__ !== $(this)[0]);//plase remove selected word of selected sentence in  this array (this array is simillar with temp array ).
        }else{
            $(this).css('outline', '-webkit-focus-ring-color auto 1px');
            CWinST_ary.push($(this)[0]); //plase save selected word of selected sentence in  this array (this array is simillar with temp array ).
        }
        
        
    });
});


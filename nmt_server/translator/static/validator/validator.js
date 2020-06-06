// initialize page (bind events etc.)
function init() {

    updateTagLists();

    $('#tagTipContainer').hide();

    $('#submit').bind('click', tag);
    $('#edit').bind('click', edit);
    $('#downloadWords').bind('click', downloadWords);
    $('#language').bind('change', language);
    $('#montessori').bind('change', function() { $('body').toggleClass('montessori'); });
    $('.toggle-tools').bind('click', function() { $('body').toggleClass('show-tools'); });
    $(window).bind('resize', function() { $('#tagTipContainer').hide(); });
    $('#tagTipContainer').bind('click', function() { $('#tagTipContainer').hide(); });

}

// Start editing
function edit() {
    $('body').removeClass('mode-view').addClass('mode-edit');
    $('#tagTipContainer').hide();
    $('.histogram').empty();
}

// Start tagging
function tag() {
    loading(true);

    var text = $('#text').val();
    text = text.replace('»', '"');
    text = text.replace('«', '"');

    $.post('/tagger/tagger', {text: text, language: $('#language').val()}, callback);

    return false;
}

// Tagging finished - process response
function callback(data) {

    var l = $('#language').val();

    var tagMap = appData[l].tagMap;
    var posAvailable = appData[l].posAvailable;
    var histogram = {};
    var histogramSum = 0;

    $('body').removeClass('mode-edit').addClass('mode-view');

    // Determine order
    var posOrder = [];
    $.each(posAvailable, function (idx, pos) {
        posOrder.push([pos, appData.i18n[name]]);
    });
    posOrder.sort(function (a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        return (a[1] < b[1]) ? -1 : 1;
    });
    posOrder = posOrder.map(function (el) { return el[0]; });

    // Construct tagged text
    var $tt = $('#textTagged');
    $tt.empty();
    var words = data.taggedText.split(" ");
    var previousWord = "";
    $.each(words, function(index, taggedWord) {
        var tag = taggedWord.substring(taggedWord.lastIndexOf("_") + 1);
        var word = taggedWord.substring(0, taggedWord.lastIndexOf("_"));
        word = word.replace("\\/", "/");
        word = word.replace("-LRB-", "(");
        word = word.replace("-RRB-", ")");
        if (
            tag != '$,' &&
            tag != '$.' &&
            word != '\'\'' &&
            word != ')' &&
            previousWord != '``' &&
            previousWord != '('
        ) {
            $tt.append(' ');
        } 
        previousWord = word;
        word = word.replace('``', '"');
        word = word.replace('\'\'', '"');
        if (word == '"') {
            tag = '';
        }
        var span = $('<span class="taggedWord" />').text(word);
        var tagInfo = tagMap[tag];
        if (tagInfo != undefined && posAvailable.indexOf(tagInfo[0]) !== -1) {
            span.addClass('tag' + tagInfo[0]);
            span.data('tag', tag);
            span.data('pos', tagInfo[0]);
            // Count for histogram
            if (histogram[tagInfo[0]] === undefined) {
                histogram[tagInfo[0]] = 1;
            }
            else {
                histogram[tagInfo[0]]++;
            }
            histogramSum++;
        }
        else {
            span.addClass('tagOther');
            span.data('tag', tag);
        }
        $tt.append(span);
    });

    // Draw histogram
    $('.histogram').empty();
    $.each(posOrder, function(idx, pos) {
        if (histogram[pos] === undefined) {
            return;
        }
        var percent = Math.round(100 * histogram[pos] / histogramSum);
        var row = $('<tr><td class="histogramPos">' + appData.i18n[pos] + '</td><td><span class="histogramBar tag' + pos + '" style="width: ' + (percent * 0.9) + '%;">&nbsp;</span><span class="histogramPercent">' + percent + '&nbsp;%</span></td></tr>');
        row.appendTo('.histogram');
    });

    $('.taggedWord').bind('click mouseover', function(ev) {
        var word = $(ev.target);
        var tagName = word.data('tag');
        var tagInfo = tagMap[tagName];
        if (tagName == "" || tagMap[tagName] == undefined) {
            return; // cancel if tag not defined
        }
        $('#tagTipContainer').show();
        if (tagInfo[0] != "" ) {
            var posName = appData.i18n[tagInfo[0]] !== undefined ? appData.i18n[tagInfo[0]] : tagInfo[0];
            var tagDescription = tagInfo[1];
            var tagExamples = tagInfo[2];
            var infoHtml = '<b>' + posName + '</b>, ' + tagName;
            if (tagDescription != '') {
                infoHtml += '<br />(' + tagDescription + ')';
            }
            if (tagExamples != '') {
                infoHtml += "<br />" + appData.i18n['label_examples'] + " " + tagExamples;
            }
            $('#tagTip').html(infoHtml);
        }
        else {
            $('#tagTip').html(tagName + ': ' + tagInfo[1]);
        }
        var pos = posAvailable.indexOf(tagInfo[0]) === -1 ? 'Other' : tagInfo[0];
        $('#tagTipContainer').removeClass();
        $('#tagTipContainer').addClass('tag' + pos);
        $('#tagTipContainer').offset({'left': word.offset().left});
        $('#tagTipContainer').offset({'top': word.offset().top + word.outerHeight()});
        $('#tagTipContainer .up').offset({'left': word.offset().left + word.outerWidth() / 2 - $('#tagTipContainer .up').outerWidth() / 2});
    });
    $('.taggedWord').bind('mouseout', function(ev) {
        $('#tagTipContainer').hide();
    });
    loading(false);
}

function loading(state) {
    if (state) {
        $('body').addClass('loading');
    }
    else {
        $('body').removeClass('loading');
    }
    $('#text').prop('disabled', state);
    $('#language').prop('disabled', state);
    $('#submit').prop('disabled', state);
}

function language() {
    updateTagLists();
    if ($('body').hasClass('mode-view')) {
        $('body').removeClass('mode-view').addClass('mode-edit');
        tag();
    }
}

function updateTagLists() {
    var l = $('#language').val();
    $('#colors div').hide();
    $('#posDownload option').hide();
    $.each(appData[l].posAvailable, function(idx, pos) {
        $('#colors div.tag' + pos).show();
        $('#posDownload option.tag' + pos).show();
    });
}

function downloadWords() {
    var posFilter = $('#posDownload').val();
    var content = "";
    var words = $('#textTagged .taggedWord');
    words.each(function(idx, word) {
        $word = $(word);
        if ($word.data('pos') !== posFilter) {
            return;
        }
        content += $word.text() + "\n";
    });
    $('#wordList').val(content);
    $('#wordListForm').submit();
}

$(window).on('load', init);


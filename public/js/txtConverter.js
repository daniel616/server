var text;
jQuery.get('writings.rtf',(data)=>{

    var i;
    text=data.split("\\\n\\");

    for(i=1;i<text.length;i++){
        var cleanText=text[i]
            .replace(/\\'9[2-5]/g,"\'")
            .replace(/\\'85/g,"...")
            .replace(/\\i/g,"<i>")
            .replace(/\\i0/g,"</i>");
        var paragraph=$('<p>');
        paragraph.html(cleanText);
        $('#main').append(paragraph);
    }
    console.log(data);
});


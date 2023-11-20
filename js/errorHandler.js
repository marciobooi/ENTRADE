function errorHandler() {

if(flagname==undefined){
  puyModal({
    title: 'Country error'
    , message: '<p>' + languageNameSpace.labels["error"] + '</p>'
    , showHeader: true
    , showFooter: false
})

}

if (REF.geo == undefined || REF.geo == '') {
    puyModal({
        title: 'Country error'
        , message: '<p>' + languageNameSpace.labels["error"] + '</p>'
        , showHeader: true
        , showFooter: false
    })

}

if(totalValues.length == 0 && countriesValue.length == 0){
    puyModal({
        title: languageNameSpace.labels["nodata"],
        message:
          "<p>" +languageNameSpace.labels["error2"] + " " + languageNameSpace.labels[REF.geo] + languageNameSpace.labels["title9"] +"</p>",
        showHeader: true,
        showFooter: false,
      });    
}

    
}
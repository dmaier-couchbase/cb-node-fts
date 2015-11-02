/**
 * Constructor
 */
function TFtsService(httpService)
{
  this.httpService = httpService;   
}

/**
 * Index the based on the field, id and text
 */
TFtsService.prototype.indexit = function(id, text, field)
{
    var url = "/service/fts/indexit?id=" + id + "&text=" + text + "&field=" + field;   
    var promise = this.httpService.post(url, {}).success(function (data) { /*Allows to handle the result and errors */ });
    return promise;
}

/**
 * Search based on the words and the field
 */
TFtsService.prototype.search = function(words, field)
{
    var url = "/service/fts/search?words=" + words + "&field=" + field;
    var promise = this.httpService.get(url, {}).success(function (data) { /*Allows to handle the result and errors */ });
    return promise;
}




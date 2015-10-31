# jQuery Ajaxs Plugin
Send jQuery ajax requests one by one or pararell

## Usage

Call jQuery.ajaxs() function with an array on jQuery ajax settings and use [done function](https://api.jquery.com/deferred.done/).

$.ajaxs([ajaxs](http://api.jquery.com/jquery.ajax/) [, useParallel: false]): [Promise](http://api.jquery.com/Types/#Promise)

### Parameters

#### ajaxs

*type*: Array  
An array of [jQuery ajax request settings](http://api.jquery.com/jquery.ajax/)

### useParallel

*type*: Boolean  
*default*: false  
True to use *parallel* mode, false to use *one by one* mode

### Return

*type*: [Promise](http://api.jquery.com/Types/#Promise)  
A Promise object with done, fail, always... functions

The deferred is resolved with the last resolve's ajax  
The deferred is rejected with the first reject's ajax

## Examples

### test.php

```php
<?php
if (isset($_GET['pos'])) {
    usleep(rand(300, 1000)*1000);
    echo "pos: ".$_GET['pos'];
    exit;
}
```

### jQuery Ajax requests

```javascript
var total = 4;
var ajaxs = [];
for (var i=0; i<total; i++) {
    ajaxs.push({
        url: 'test.php',
        data: {
            pos: i
        },
        success: function(data) {
            console.log("Done! "+data);
        }
    });
}
```

### One by one

```javascript
$.ajaxs(ajaxs)
    .done(function() {
        console.log("Finished OK");
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Finished KO", textStatus, errorThrown);
    });
```

##### Ouput:

```
Done! pos: 0  
Done! pos: 1  
Done! pos: 2  
Done! pos: 3  
Finished OK
```

### Parallel

```javascript
$.ajaxs(ajaxs, true)
    .done(function() {
        console.log("Finished OK");
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Finished KO", textStatus, errorThrown);
    });
```

##### Ouput:

```
Done! pos: 2  
Done! pos: 1  
Done! pos: 0  
Done! pos: 3  
Finished OK
```

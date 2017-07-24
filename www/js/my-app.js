// Initialize app
var myApp = new Framework7();
var db;

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

//delete event
$$(document).on('deleted','.remove-callback',function(){
    var workoutId = $$(this).attr('id');

    deleteworkout(workoutId);
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    db = window.openDatabase('workouttracker','1.0','Workout Tracker',10000);
    //name, version, readble name, size
    createDatabase();
    getWorkouts();
});



// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
//add page
myApp.onPageInit('add', function (page) {
    console.log("add page");
    // Do something here for "add" page
    $$('#workout-form').on('submit',function(e){
        var data = {
            id: guidGenerator(),
            title: $$('#title').val(),
            date: $$('#date').val(),
            type: $$('#type').val(),
            length: $$('#length').val(),
        }

        addWorkout(data);
    });

});

//details page
myApp.onPageInit('details', function (page) {
    // Do something here for "details" page
    console.log("details page");
    var workoutId = page.query.id;
    console.log("workoutId:"+workoutId);
    getWorkoutDetails(workoutId);

});

function createTable(tx){
    //tx.executeSql('DROP TABLE IF EXISTS workouts');
    tx.executeSql('CREATE TABLE IF NOT EXISTS workouts (id unique, title, date, type, length)');
}

function createDatabase(){
    db.transaction(createTable,
        function(ex, err){
            alert("DB Error: "+err.code);
        },
        function(){
            console.log("Database & Table created...");
        });
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function addWorkout(workout){
    db.transaction(function(tx){
        tx.executeSql('INSERT INTO workouts (id, title, date, type, length) VALUES ("'+workout.id+'","'+workout.title+'","'+workout.date+'","'+workout.type+'","'+workout.length+'")');
    },
    function(err){
        console.log(err);
    },
    function(){
        window.location.href='index.html';
    });
}

function getWorkouts(){
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM workouts ORDER BY date DESC', [], 
            function(tx, results){//success callback
                var len = results.rows.length;
                console.log('workouts table:' + len + 'rows found');
                for(var i = 0; i < len; i ++){
                    $$('#workout-list').append(`
                        <li class="swipeout remove-callback" id="${results.rows.item(i).id}">
                            <a href="details.html?id=${results.rows.item(i).id}" class="item-link swipeout-content item-content">
                                <div class="item-inner">
                                    <div class="item-title">${results.rows.item(i).title}</div>
                                    <div class="item-after">${results.rows.item(i).date}</div>
                                </div>
                            </a>
                            <div class="swipeout-actions-right">
                                <a href="#" class="swipeout-delete">Delete</a>
                            </div>
                        </li>
                    `);//`` => multiple lines
                }
            },
            function(err){//error callback
                console.log(err);
            });
    });
}




function deleteworkout(id){
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM workouts WHERE id = "'+id+'"');
    },
    function(err){
        console.log(err);
    },
    function(){
        console.log("Workout Deleted");
    });
}


function getWorkoutDetails(id){
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM workouts WHERE id = "'+id+'"', [],
            function(tx, result){
                $$('#workout-details').html(`
                    <div class="card">
                        <div class="card-header">${result.rows[0].title}</div>
                        <div class="card-content">
                            <div class="card-content-inner">
                                <ul>
                                    <li>Workout Type: ${result.rows[0].type}</li>
                                    <li>Workout Length: ${result.rows[0].length}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-footer">Date: ${result.rows[0].date}</div>
                    </div>
                `);
            },
            function(err){
                console.log(err);
            });
    });
}


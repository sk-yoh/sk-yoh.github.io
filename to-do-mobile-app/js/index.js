$(function() {
	var Item = function(title, type) {
		this.title = title;
		this.type = type;
	}
	
	var list = [
		new Item("Fix Animation Bug", "Animation"),
		new Item("New UI for the Dashboard", "Mobile UI"),
		new Item("Login Screen implementation", "Desktop App"),
		new Item("Onboarding", "Wireframe"),
		new Item("Conference Presention", "Presentation"),
		new Item("Export Icons in SVG", "Web development"),
		new Item("Export Icons in SVG", "Web development"),
		new Item("Export Icons in SVG", "Web development")
	];
	
	for (var key in list) {
		var item = list[key];
		addItem(item);
	}
	
	$('#list').on('click', 'li .desc', function() {
		var li = $(this).parent();
		if (li.hasClass('toggled')) {
			li.removeClass('toggled');
		} else {
			li.addClass('toggled');
			$('.toggled').not(li).removeClass('toggled');
		}
	});
	$('#list').on('click', 'li .btn-group .remove', function() {
		var li = $(this).closest('li');
		li.css({'height':'0'});
		setTimeout(function() {
			li.remove();
		}, 350);
	});
	$('.add #button').click(function() {
		var menu = $(this).closest('.add-menu');
		if (menu.hasClass('toggled')) {
			menu.removeClass('toggled');
		} else {
			menu.addClass('toggled');
			$('.toggled').not(menu).removeClass('toggled');
		}
	});
	$('.add-menu #add').click(function() {
		var menu = $(this).closest('.add-menu');
		var title = $('#title', menu);
		var type = $('#type', menu);
		addItem(new Item(title.val(), type.val()));
		title.val("");
		type.val("");
		menu.removeClass('toggled');
	});
	
	function addItem(item) {
		$('#list').append('<li><div class="btn-group"><div class="done"><span class="fa fa-check"></span></div><div class="remove"><span class="fa fa-times"></span></div></div><div class="desc"><span class="title">' + item.title + '</span><span class="type">' + item.type + '</span></div></li>');
	}
});
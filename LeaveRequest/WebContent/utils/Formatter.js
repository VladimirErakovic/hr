jQuery.sap.declare("mkbs.leaverequest.utils.Formatter");
jQuery.sap.require("jquery.sap.resources");
//jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("sap.ui.core.format.DateFormat");

mkbs.leaverequest.utils.Formatter = { 
	
		
		dateWithText: function (value) { 
			if (value) { 
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});		
				//var tommorow = new Date();
				//tommorow.setDate(tommorow.getDate() + 1);
				var today = oDateFormat.format(new Date());
				var current = oDateFormat.format(new Date(value));
				if (today == current) {
					return "Danas";
				} else {   
					return oDateFormat.format(new Date(value));
				}
			} else { 
				return value; 
			} 
		},
		
		date: function (value) { 
			if (value) { 
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});   
					return oDateFormat.format(new Date(value));
			} else { 
				return value; 
			} 
		},
		
		quantity : function (value) { 
	        var formatter = new Intl.NumberFormat('de-DE'); 
			try { 
				return (value) ? formatter.format(parseFloat(value).toFixed(0)) : value; 
			} catch (err) { 
				return "Not-A-Number"; 
			} 
		},
		
		statusText: function(value) {
			var oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
			if (value === "") {
				return oBundle.getText("StatusSent");
			} else if (value === "1") {
				return oBundle.getText("StatusApproved");
			} else if (value === "2") {
				return oBundle.getText("StatusWithdrawn");
			} else {
				return oBundle.getText("StatusRejected");
			}
		},
		
		statusState: function(value) {
			if (value === "") {
				return "None";
			} else if (value === "1") {
				return "Success";
			} else if (value === "2") {
				return "Warning";
			} else {
				return "Error";
			}
		},
		
		daysOrHours : function (abwtg, stdaz) { 
	        var formatter = new Intl.NumberFormat('en-US'); 
	        if (formatter.format(parseFloat(stdaz).toFixed(0)) == 0) {
				try { 
					return (abwtg) ? formatter.format(parseFloat(abwtg).toFixed(0)) : abwtg; 
				} catch (err) { 
					return "Not-A-Number"; 
				} 
	        } else {
				try { 
					return (stdaz) ? formatter.format(parseFloat(stdaz).toFixed(2)) : stdaz; 
				} catch (err) { 
					return "Not-A-Number"; 
				} 
	        }
		},
		
		specialText: function(value) {
			if (value === "") {
				return "Izlazak sa posla";
			} else {
				return value;
			}
		}

	
};
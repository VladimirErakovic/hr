sap.ui.define([
	"sap/ui/core/mvc/Controller",
 	"sap/m/MessageBox",
 	"sap/m/MessageToast",
 //	"sap/ui/model/type/Date",
 	"sap/ui/model/json/JSONModel",
 	"sap/m/Dialog",
   	"sap/ui/layout/VerticalLayout",
   	"sap/ui/layout/HorizontalLayout",
 	"sap/m/Text",
 	"sap/m/Button",
 	"jquery.sap.storage",
 	'sap/ui/unified/CalendarLegendItem',
 	'sap/ui/unified/DateTypeRange',
 	'sap/ui/core/format/NumberFormat'
], function(Controller, MessageBox, MessageToast, JSONModel, // Date,
		Dialog, VerticalLayout, HorizontalLayout, Text, Button, jQuery, CalendarLegendItem, DateTypeRange, NumberFormat) {	
	"use strict";
	
	var that, oBundle, oView, user, pass, oJQueryStorage, userPernr, mngrPernr, sysUsername;
	
	var calendar, calendarLegend;

	return Controller.extend("mkbs.leaverequest.view.Main", {	

	 
		onInit: function () {
			
			that = this;
			
	        	oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
	        
	        	oView = this.getView();
	        
			user = oBundle.getText("GatewayUsername");
			pass = oBundle.getText("GatewayPassword");        
			
			userPernr = null;
			
			// set models only first time page load
			var oAbsenceModel = new JSONModel("model/absence.json");
			oView.byId("idAbsenceComboBox").setModel(oAbsenceModel);			
			var oPaidLeaveModel = new JSONModel("model/paid_leave.json");
			oView.byId("idPaidLeaveComboBox").setModel(oPaidLeaveModel);
			
		    	this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    	this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
	 
		},
		
		handleRouteMatched : function (oEvent) {
			
			if (oEvent.getParameter("name") === "Main") {
				
				oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
				userPernr = oJQueryStorage.get("user_pernr");
				mngrPernr = oJQueryStorage.get("manager_pernr");
				sysUsername = oJQueryStorage.get("sys_uname");	
				var managerName = oJQueryStorage.get("manager_name");
				var realUserName = oJQueryStorage.get("real_username");

				
				if (userPernr == null) {
					MessageToast.show(oBundle.getText("NoUserErrorToast"));
					that.getOwnerComponent().getRouter().navTo("Login", null, true);
				}
				

				oView.byId("pageTitleUserName").setText(oBundle.getText("MainTitle") + " " + realUserName);
				oView.byId("idManager").setValue(managerName);
				oView.byId("idComment").setValue("");
				oView.byId("absenceCalendar").removeAllSelectedDates();
				
				calendar = oView.byId("absenceCalendar");
				calendarLegend = oView.byId("calendarLegendId");
				
				calendarLegend.destroyItems();
				
				calendarLegend.addItem(new CalendarLegendItem({
					text: oBundle.getText("HolidayLabel"),
					type: sap.ui.unified.CalendarDayType.Type09
				}));
				calendarLegend.addItem(new CalendarLegendItem({
					text: oBundle.getText("ReligiousHolidayLabel"),
					type: sap.ui.unified.CalendarDayType.Type07
				}));
				calendarLegend.addItem(new CalendarLegendItem({
					text: oBundle.getText("PaidLeaveLabel"),
					type: sap.ui.unified.CalendarDayType.Type02
				}));
				
				
				var urlTimeQuota = "proxy/https/***/sap/opu/odata/SAP/ZHR_REMAINING_TIMEQUOTA_SRV/";
				var oTimeQuota = new sap.ui.model.odata.ODataModel(urlTimeQuota, true, user, pass); 
				
				oTimeQuota.read("/EtTimeQuotaSet(ImPernr='" + userPernr + "')", null, null, false, 
						function(oResponse) {
			
						    var timeQuota = parseInt(oResponse.ExQuota);
						    oView.byId("idDaysRemain").setValue(timeQuota);
					
						}, 		
						function(oError) {
			
						    sap.m.MessageBox.show(
						    		oBundle.getText("ServerComErrorTimequota"), {
							          icon: MessageBox.Icon.ERROR,
							          title: oBundle.getText("ServerErrorMsg"),
							          actions: MessageBox.Action.OK
							      }
							);
				
						}
				);	
				
				
				var FilterOperator = sap.ui.model.FilterOperator;
				var filters = [new sap.ui.model.Filter("Pernr", FilterOperator.EQ, userPernr)]
				
		        var oBinding = oTimeQuota.bindList("/EtRangesSet");
		        oBinding.filter(filters);
		        
		        var _handler = function() {
		        	$(oBinding.getContexts()).each(function(i, context){
		        		
		        		if (oTimeQuota.getProperty("Awart", context) === '0100'){
		        			
			    			calendar.addSpecialDate(new DateTypeRange({
								startDate: oTimeQuota.getProperty("Begda", context),
								endDate: oTimeQuota.getProperty("Endda", context),
								type: sap.ui.unified.CalendarDayType.Type09
							}));  
			    			
		        		} else if (oTimeQuota.getProperty("Awart", context) === '0110') {
		        			
			    			calendar.addSpecialDate(new DateTypeRange({
								startDate: oTimeQuota.getProperty("Begda", context),
								endDate: oTimeQuota.getProperty("Endda", context),
								type: sap.ui.unified.CalendarDayType.Type07
							})); 
			    			
		        		} else if (oTimeQuota.getProperty("Awart", context) === '0210') {
		        			
			    			calendar.addSpecialDate(new DateTypeRange({
								startDate: oTimeQuota.getProperty("Begda", context),
								endDate: oTimeQuota.getProperty("Endda", context),
								type: sap.ui.unified.CalendarDayType.Type02
							})); 
			    			
		        		}
		        		
		        	});
		        };
		        
		        oBinding.attachChange(_handler);
		        oBinding.getContexts();		
			
			}
		},
		
		btnSendPress: function(event) {
			
			var busyDialog  = oView.byId("BusyDialog");
			
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-ddTHH:mm:ss", calendarType: sap.ui.core.CalendarType.Gregorian});
			var oDateFormatDisplay = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});
			
			var absenceType = oView.byId("idAbsenceComboBox").getSelectedKey();	
			var absenceTypeText = oView.byId("idAbsenceComboBox").getSelectedItem().getText();
			var startDate, startDateDisplay;
			var endDate, endDateDisplay;
			
			var urlSendRequest = "proxy/https/***/sap/opu/odata/SAP/ZHR_ABSENCE_REQUEST_SRV/";
			var oRequestModel = new sap.ui.model.odata.ODataModel(urlSendRequest, true, user, pass); 
			
			var comment = oView.byId("idComment").getValue();
			var commentEncoded = encodeURIComponent(comment);

			var hoursOfAbsence = oView.byId("idHoursOfAbsence").getValue();
			hoursOfAbsence = hoursOfAbsence.replace(',','.');
	        	var number = Number(hoursOfAbsence);  
	        	var hours = parseFloat(number).toFixed(2);
			var hoursFloat = hours + "d";
			
			if (absenceType === "9999") {
				if (hours <= 0) {
					// Niste uneli broj sati odsustva
					MessageToast.show(oBundle.getText("NoHoursEntered"));
					return;
				}
				if (comment.trim().length == 0) {
					// Za izlazak sa posla unesite razlog u komentar
					MessageToast.show(oBundle.getText("NoCommentEntered"));
					return;
				}
			}
			
			if (absenceType === "0210") {
				var paidLeaveType = oView.byId("idPaidLeaveComboBox").getSelectedKey();
				if (paidLeaveType === "0100") {
					// Odaberite vrstu plaćenog odsustva
					MessageToast.show(oBundle.getText("NoPaidLeaveChoosed"));
					return;
				}
			}
	        		
			var oCalendar = oView.byId("absenceCalendar");
			var aSelectedDates = oCalendar.getSelectedDates();
			var numberOfDays;
			var oDateStart, oDateEnd;
			var todayDate = new Date();				
			todayDate.setDate(todayDate.getDate() - 1);
			
			if (aSelectedDates.length > 0 ) {
				oDateStart = aSelectedDates[0].getStartDate();
				startDate = oDateFormat.format(oDateStart);
				startDateDisplay = oDateFormatDisplay.format(oDateStart);
				oDateEnd = aSelectedDates[0].getEndDate();
				endDate = oDateFormat.format(oDateEnd);
				endDateDisplay = oDateFormatDisplay.format(oDateEnd);
				if (oDateStart < todayDate){
					// Uneli ste datum u proslosti
					MessageToast.show(oBundle.getText("DateLowerError"));
					return;
				}
				if(endDate == "") {
					endDate = startDate; 
					endDateDisplay = startDateDisplay;
				}
			} else {
				// Izaberite period odsustva
				MessageToast.show(oBundle.getText("SetDateRangeError"));
				return;
			}
						
			oRequestModel.read("/EtNumberDaysSet(ImBegda=datetime'" + startDate + "',ImEndda=datetime'" + endDate + "')", null, null, false, 
					function(oResponse) {
		
						numberOfDays = oResponse.ExNumber;
		
					}, 		
					function(oError) {
			
					}
			);
			
			var daysHoursLabel = "";
			var daysHoursValue = 0;
			if (absenceType === "9999") {
				daysHoursLabel = oBundle.getText("CDNumberOfHours");
				daysHoursValue = hours;
			} else {
				daysHoursLabel = oBundle.getText("CDNumberOfDays");
				daysHoursValue = numberOfDays;
			}
			
			
			var dialog = new Dialog({
				title: oBundle.getText("ConfirmDialogTitle"),
				type: 'Message',
				content: [
					new VerticalLayout({
						content: [
							new Text({ text: oBundle.getText("ConfirmDialogText") }),
							new Text({ text: " " }),
							new HorizontalLayout({
								width: "100%",
								content: [
									new VerticalLayout({
										width: "150px",
										content: [
											new Text({ text: oBundle.getText("CDAbsenceType") }),
											new Text({ text: daysHoursLabel }),
											new Text({ text: oBundle.getText("CDStartDate") }),
											new Text({ text: oBundle.getText("CDEndDate") })
										]
									}),
									new VerticalLayout({
										content: [
											new Text({ text: absenceTypeText }),
											new Text({ text: daysHoursValue }),
											new Text({ text: startDateDisplay }),
											new Text({ text: endDateDisplay })
										]
									})
								]
							})
						]
					})
				],
				beginButton: new Button({
					text: oBundle.getText("CDSendButton"),
					press: function () {
						
						busyDialog.setVisible(true);
						busyDialog.open();
						
						oRequestModel.read("/EtRequestSet(ImPernr='" + userPernr + "',ImAbtyp='" + absenceType + "',ImBegda=datetime'" + startDate 
								+ "',ImEndda=datetime'" + endDate + "',ImUname='" + sysUsername + "',ImMngrn='" + mngrPernr  
								+ "',ImCmmnt='" + commentEncoded + "',ImHours=" + hoursFloat + ")", null, null, true, //bilo false ali treba true!!! async
								function(oResponse) {
					
								    var message = oResponse.ExMessage;
					
								    MessageToast.show(message);

								    oView.byId("idComment").setValue("");
								    oView.byId("absenceCalendar").removeAllSelectedDates();
								    oView.byId("idHoursOfAbsence").setValue("");
								    
								    dialog.close();
					
								}, 		
								function(oError) {
					
								    sap.m.MessageBox.show(
								    		oBundle.getText("CheckInternetConnection"), {
									          icon: MessageBox.Icon.ERROR,
									          title: oBundle.getText("ServerErrorMsg"),
									          actions: MessageBox.Action.OK
									      }
									);
						
								}
							);	
						
					}
				}),
				endButton: new Button({
					text: oBundle.getText("CDCancelButton"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					busyDialog.close();
					busyDialog.setVisible(false);
					dialog.destroy();
				}
			});

			dialog.open();
			
		},
		
		btnResetPress: function() {
			
		    oView.byId("idComment").setValue("");
		    oView.byId("absenceCalendar").removeAllSelectedDates();
		    oView.byId("idHoursOfAbsence").setValue("");
			
		},
		
		btnChangePass: function() {
			
			this.getOwnerComponent().getRouter().navTo("ChangePass" ,{});
			
		},
		
		btnHistory: function() {
			
			this.getOwnerComponent().getRouter().navTo("Master" ,{});
			
		},
		
		btnLogOut:	function() {
			
			oJQueryStorage.remove("login_username");
			oJQueryStorage.remove("login_password");
			oJQueryStorage.remove("user_pernr");
			oJQueryStorage.remove("manager_pernr");
			oJQueryStorage.remove("sys_uname");
			oJQueryStorage.remove("manager_name");

			this.getOwnerComponent().getRouter().navTo("Login", null, true);

		},
		
		
		onAbsenceTypeChange: function() {
			
			var absenceType = oView.byId("idAbsenceComboBox").getSelectedKey();
			
			if (absenceType === "9999") {
				oView.byId("absenceHoursLabel").setVisible(true);
				oView.byId("idHoursOfAbsence").setVisible(true);
			} else {
				oView.byId("absenceHoursLabel").setVisible(false);
				oView.byId("idHoursOfAbsence").setVisible(false).setValue("0");
			}
			
			if (absenceType === "0210") {
				oView.byId("paidLeaveTypesLabel").setVisible(true);
				oView.byId("idPaidLeaveComboBox").setVisible(true);
				oView.byId("emptyLabel").setVisible(true);
			} else {
				oView.byId("paidLeaveTypesLabel").setVisible(false);
				oView.byId("idPaidLeaveComboBox").setVisible(false);
				oView.byId("emptyLabel").setVisible(true);
			}
			
		},
		
		
		onHoursChange: function(oEvent) {
			
	        var value = oEvent.getSource().getValue(); 
	        var priceInput = oView.byId("idHoursOfAbsence");
	        value = value.replace(',','.');
	        
	        if (parseFloat(value) > 0.0) {
		        //value = value.replace('.','');
		        //value = value.replace(',','.');
		        var number = Number(value);
	
		        var floatValue = parseFloat(number).toFixed(2);
		 
		        var formatter = new Intl.NumberFormat('en-US', {	//de-DE
		        	minimumFractionDigits: 2
		        });  
		        
		        priceInput.setValue(formatter.format(floatValue)); 
	        } else {
	        	priceInput.setValue("0.00");
	        }

		}
		
		
	});
});

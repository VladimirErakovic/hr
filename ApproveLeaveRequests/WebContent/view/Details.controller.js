sap.ui.define([
       	"sap/ui/core/mvc/Controller",
       	"sap/m/MessageBox",
       	"sap/m/MessageToast",
        "sap/ui/core/format/DateFormat",
       	"sap/m/Dialog",
       	"sap/ui/layout/HorizontalLayout",
       	"sap/ui/layout/VerticalLayout",
       	"sap/m/Text",
       	"sap/m/TextArea",
       	"sap/m/Button",
       	"jquery.sap.resources",
       	"jquery.sap.storage"
       ], function (Controller, MessageBox, MessageToast, DateFormat, 
    		   Dialog, HorizontalLayout, VerticalLayout, Text, TextArea, Button, jQuery) {
       "use strict";
       
       var oView, oBundle, user, pass, sysUsername, managerPernr, oModel, oJQueryStorage, that;
       // oData model from Master 
       var userName, beginDate, endDate, beginDateDisplay, endDateDisplay, userPernr, numberOfDays, 
       	   hoursOfAbsence, requestDate, absenceType, absenceTypeText, requestId, timeQuota, userComment;
       
       var approveDialog, rejectDialog, busyDialog;
   	
       return Controller.extend("mkbs.approveleaverequests.view.Details", {

			onInit: function() {
				
				that = this;
				
				oView = this.getView();
				
				busyDialog  = oView.byId("BusyDialog");
				
		        oBundle = jQuery.sap.resources({url: "i18n/i18n.properties"});
		        
				user = oBundle.getText("GatewayUsername");
				pass = oBundle.getText("GatewayPassword");  
		        
				oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);					
				sysUsername = oJQueryStorage.get("alr_sys_uname");
				managerPernr = oJQueryStorage.get("alr_user_pernr");
		        
			    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
		        

			},
			
			
			handleRouteMatched : function (oEvent) {
				
				if (oEvent.getParameter("name") === "RequestDetails") {
					
					var oDateFormatLong = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-ddTHH:mm:ss", calendarType: sap.ui.core.CalendarType.Gregorian});
					var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "dd.MM.yyyy"});
					var floatFormatter = new Intl.NumberFormat('en-US', {
			        	minimumFractionDigits: 2
			        });
					
					var bindingContext = oView.getBindingContext();
					requestId = oEvent.getParameter("arguments").requestId;
					
					var urlDetails = "proxy/https/sapgw.mk-group.org:42080/sap/opu/odata/SAP/ZHR_GET_LEAVE_REQUESTS_SRV/";
					var oDetailsModel = new sap.ui.model.odata.ODataModel(urlDetails, true, user, pass); 
					
					oDetailsModel.read("/EtDetailsSet(ImReqid='" + requestId + "')", null, null, false, 
							function(oResponse) { // onSuccess function 

							    userName = oResponse.ExSname;
							    beginDateDisplay = oDateFormat.format(new Date(oResponse.ExBegda));
							    beginDate = oDateFormatLong.format(new Date(oResponse.ExBegda));
							    endDateDisplay = oDateFormat.format(new Date(oResponse.ExEndda));
							    endDate = oDateFormatLong.format(new Date(oResponse.ExEndda));
							    userPernr = oResponse.ExPernr;
							    userPernr = userPernr.replace(/^0+/, '');
							    numberOfDays = parseInt(oResponse.ExAbwtg);
							    hoursOfAbsence = floatFormatter.format(parseFloat(oResponse.ExStdaz).toFixed(2));
							    requestDate = oDateFormat.format(new Date(oResponse.ExEdate));
							    absenceType = oResponse.ExAwart;
							    absenceTypeText = oResponse.ExAtext;
							    timeQuota = parseInt(oResponse.ExTmqta);
							    userComment = oResponse.ExCmmnt;
							    
							    if (absenceType === "9999") {	
							    	oView.byId("requestDetailHeader")
							    		.setNumber(hoursOfAbsence)
							    		.setNumberUnit(oBundle.getText("NumberOfHours"));
							    	oView.byId("leaveTypeValue").setText(oBundle.getText("ShortExitFromWork"));
							    } else {
							    	oView.byId("requestDetailHeader")
							    		.setNumber(numberOfDays)
							    		.setNumberUnit(oBundle.getText("ListUnitDays"));
							    	oView.byId("leaveTypeValue").setText(absenceTypeText);
							    }
							    
								oView.byId("requestDetailHeader").setTitle(userName);
										
								var headerAttributes = {}; 
								headerAttributes =  oView.byId("requestDetailHeader").getAttributes();
								headerAttributes[0].setText(userPernr);
								headerAttributes[1].setText("Od: " + beginDateDisplay + " do: " + endDateDisplay); 
												
								oView.byId("requestDate").setText(requestDate);						
									
								if (userComment == "") {
									oView.byId("commentTab").setCount("");
								} else {
									oView.byId("commentTab").setCount("1");
								}
								oView.byId("commentValue").setText(userComment);
							    oView.byId("balanceValue").setText(timeQuota);
						
							}, 		
							function(oError) { // onError function
				
							    sap.m.MessageBox.show(
							    		oBundle.getText("CheckInternetConnection"), {
								          icon: MessageBox.Icon.ERROR,
								          title: oBundle.getText("Error"),
								          actions: MessageBox.Action.OK
								      }
								);
					
							}
					);
				
				}
			},
			
			btnSendPress: function(oEvent) {
				
				var requestLabel = "";
				var requestValue;
				if (absenceType === "9999") {
					absenceTypeText = "Izlazak sa posla";
					requestLabel = oBundle.getText("ApproveDialogReqHours");
					requestValue = hoursOfAbsence;
				} else {
					requestLabel = oBundle.getText("ApproveDialogRequested");
					requestValue = numberOfDays;
				}
									
				approveDialog = new Dialog({
					title: oBundle.getText("ApproveDialogTitle"),
					type: "Message",
					content: [
						new VerticalLayout({
							content: [
								new Text({ text: oBundle.getText("ApproveDialogText") + " " + userName + "?" }),
								new Text({ text: " " }),
								new HorizontalLayout({
									width: "100%",
									content: [
										new VerticalLayout({
											width: "120px",
											content: [
												new Text({ text: oBundle.getText("AbsenceType") + ":" }),
												new Text({ text: requestLabel + ":" })
											]
										}),
										new VerticalLayout({
											content: [
												new Text({ text: absenceTypeText }),
												new Text({ text: requestValue })
											]
										})
									]
								}) 
							]
						})
					],
					beginButton: new Button({
						text: oBundle.getText("ApproveButton"),  
						tap: [ this.onSendApproval, this ]
					}),
					endButton: new Button({
						text: oBundle.getText("CancelButton"),
						press: function () {
							approveDialog.close();
						}
					}),
					afterClose: function() {
						busyDialog.close();
						busyDialog.setVisible(false);
						approveDialog.destroy();
					}
				});

				approveDialog.open();			
				
			},
			
			onSendApproval: function() {

				busyDialog.setVisible(true);
				busyDialog.open();
				
				var urlAbsence = "proxy/https/sapgw.mk-group.org:42080/sap/opu/odata/SAP/ZHR_ABSENCE_CREATE_SRV/";
				var oAbsenceModel = new sap.ui.model.odata.ODataModel(urlAbsence, true, user, pass);
				
				oAbsenceModel.read("/EtAbsenceCreateSet(ImPernr='" + userPernr + "',ImAbtyp='" + absenceType + "',ImBegda=datetime'" + beginDate 
						+ "',ImEndda=datetime'" + endDate + "',ImReqid='" + requestId + "',ImMngpr='" + managerPernr 
						+ "',ImMngrn='" + sysUsername + "')", null, null, true, 
						function(oResponse) {
			
						    var error = oResponse.ExErrmsg;
						    var enqueueError = oResponse.ExEnqmsg;
						    
						    if(error === "") {	
						    	
						    	if (enqueueError === "") {
			    
								    MessageToast.show(oBundle.getText("ApprovedSuccessMsg"));
								    
								    approveDialog.close();
								    
								    // refresh master list
									sap.ui.getCore().getModel(oModel).refresh();
									// set no item page
									that.getOwnerComponent().getRouter().navTo("Master");
									
						    	} else {
						    		
						    		approveDialog.close();
						    		
								    sap.m.MessageBox.show(
								    		oBundle.getText("EnqueueErrorMsg"), {
									          icon: MessageBox.Icon.ERROR,
									          title: oBundle.getText("Error"),
									          actions: MessageBox.Action.OK
									      }
									);	
						    		
						    	}
								
						    } else {
			
							    sap.m.MessageBox.show(
							    		oBundle.getText(error), {
								          icon: MessageBox.Icon.ERROR,
								          title: oBundle.getText("Error"),
								          actions: MessageBox.Action.OK
								      }
								);			
						    }
			
						}, 		
						function(oError) {
			
						    sap.m.MessageBox.show(
						    		oBundle.getText("CheckInternetConnection"), {
							          icon: MessageBox.Icon.ERROR,
							          title: oBundle.getText("Error"),
							          actions: MessageBox.Action.OK
							      }
							);
				
						}
					);
  
				
				
			},
			
			
			btnRejectPress: function(event) {
				
				var requestLabel = "";
				var requestValue;
				if (absenceType === "9999") {
					absenceTypeText = "Izlazak sa posla";
					requestLabel = oBundle.getText("ApproveDialogReqHours");
					requestValue = hoursOfAbsence;
				} else {
					requestLabel = oBundle.getText("ApproveDialogRequested");
					requestValue = numberOfDays;
				}
				
				rejectDialog = new Dialog({
					title: oBundle.getText("RejectDialogTitle"),
					type: 'Message',
					content: [
						new VerticalLayout({
							content: [
								new Text({ text: oBundle.getText("RejectDialogText") + " " + userName + "?" }),
								new Text({ text: " " }),
								new HorizontalLayout({
									width: "100%",
									content: [
										new VerticalLayout({
											width: "120px",
											content: [
												new Text({ text: oBundle.getText("AbsenceType") + ":" }),
												new Text({ text: requestLabel + ":" })
											]
										}),
										new VerticalLayout({
											content: [
												new Text({ text: absenceTypeText }),
												new Text({ text: requestValue })
											]
										})
									]
								}),
								new TextArea('rejectDialogTextarea', {
									width: "100%",
									placeholder: oBundle.getText("DialogNoteTip")
								})
							]
						})
					],
					beginButton: new Button({
						text: oBundle.getText("RejectButton"),  
						tap: [ this.onSendRejection, this ]
					}),
					endButton: new Button({
						text: oBundle.getText("CancelButton"),
						press: function () {
							rejectDialog.close();
						}
					}),
					afterClose: function() {
						busyDialog.close();
						busyDialog.setVisible(false);
						rejectDialog.destroy();
					}
				});

				rejectDialog.open();			
				
			},
			
			
			onSendRejection: function() {
				
				busyDialog.setVisible(true);
				busyDialog.open();
				
				var rejectText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
				var rejectTextEncoded = encodeURIComponent(rejectText);
				
				var urlAbsence = "proxy/https/sapgw.mk-group.org:42080/sap/opu/odata/SAP/ZHR_ABSENCE_CREATE_SRV/";
				var oAbsenceModel = new sap.ui.model.odata.ODataModel(urlAbsence, true, user, pass); 
				
				oAbsenceModel.read("/EtAbsenceRejectSet(ImUname='" + sysUsername + "',ImMngpr='" + managerPernr
						+ "',ImCmmnt='" + rejectTextEncoded + "',ImReqid='" + requestId + "')", null, null, true, 
						function(oResponse) { 
			
						    var error = oResponse.ExErrmsg;
						    
						    if(error === "") {	
							    
							    MessageToast.show(oBundle.getText("RejectedSuccessMsg"));
							    
							    rejectDialog.close();
							    
							    // refresh master list
								sap.ui.getCore().getModel(oModel).refresh();
								// set no item page
								that.getOwnerComponent().getRouter().navTo("Master");
								
						    } else {
			
							    sap.m.MessageBox.show(
							    		oBundle.getText(error), {
								          icon: MessageBox.Icon.ERROR,
								          title: oBundle.getText("Error"),
								          actions: MessageBox.Action.OK
								      }
								);			
						    }
			
						}, 		
						function(oError) {
			
						    sap.m.MessageBox.show(
						    		oBundle.getText("CheckInternetConnection"), {
							          icon: MessageBox.Icon.ERROR,
							          title: oBundle.getText("Error"),
							          actions: MessageBox.Action.OK
							      }
							);
				
						}
					);						
				
			},
			
			handleNavButtonPress: function() {
				
				that.getOwnerComponent().getRouter().navTo("Master");
				
			}

			
		});
	}
);
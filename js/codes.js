/*
Definition, mapping and handling of Eurobase codes
*/

geoCountries = {	
	"EA": "",
	"BE": "",
	"BG": "",
	"CZ": "",
	"DK": "",
	"DE": "",
	"EE": "",
	"IE": "",
	"EL": "",
	"ES": "",
	"FR": "",
	"HR": "",
	"IT": "",
	"CY": "",
	"LV": "",
	"LT": "",
	"LU": "",
	"HU": "",
	"MT": "",
	"NL": "",
	"AT": "",
	"PL": "",
	"PT": "",
	"RO": "",
	"SI": "",
	"SK": "",
	"FI": "",
	"SE": "",
	"UK": "",
	"IS": "",
	"LI": "",
	"NO": "",
	"ME": "",
	"MK": "",
	"RS": "",
	"TR": "",
	"BA": "",
	"XK": "",
	"MD": "",
	"UA": ""
};

partner = {
	// "BE":"",	
	// "BG":"",	
	// "CZ":"",	
	// "DK":"",	
	// "DE":"",	
	// "EE":"",	
	// "IE":"",	
	// "EL":"",	
	// "ES":"",	
	// "FR":"",	
	// "HR":"",	
	// "IT":"",	
	// "CY":"",	
	// "LV":"",	
	// "LT":"",	
	// "LU":"",	
	// "HU":"",	
	// "MT":"",	
	// "NL":"",	
	// "AT":"",	
	// "PL":"",	
	// "PT":"",	
	// "RO":"",	
	// "SI":"",	
	// "SK":"",	
	// "FI":"",	
	// "SE":"",	
	// "UK":"",	
	// "IS":"",	
	// "NO":"",	
	// "CH":"",	
	// "ME":"",	
	// "MK":"",	
	// "AL":"",	
	// "RS":"",	
	// "TR":"",	
	// "BY":"",	
	// "BA":"",	
	// "XK":"",	
	// "MD":"",	
	// "RU":"",	
	// "UA":"",	
	// "EUR_OTH":"",	
	// "MZ":"",	
	// "ZA":"",	
	// "CA":"",	
	// "US":"",	
	// "MX":"",	
	// "BR":"",	
	// "CL":"",	
	// "CO":"",	
	// "EC":"",	
	// "PE":"",	
	// "VE":"",	
	// "AME_OTH":"",	
	// "KZ":"",	
	// "KG":"",	
	// "TJ":"",	
	// "TM":"",	
	// "UZ":"",	
	// "CN":"",	
	// "JP":"",	
	// "KP":"",	
	// "IN":"",	
	// "IR":"",	
	// "PK":"",	
	// "ID":"",	
	// "MY":"",	
	// "SG":"",	
	// "VN":"",	
	// "AM":"",	
	// "AZ":"",	
	// "GE":"",	
	// "IL":"",	
	// "SA":"",	
	// "AE":"",	
	// "ASI_OTH":"",	
	// "AU":"",	
	// "NZ":"",	
	// "TOTAL":"",	
	// "NSP":"",	
};

colors = [
	"#1F497D", "#faa519", "#32AFAF", "#F06423",
	"#C84B96", "#5FB441", "#286EB4", "#802F09",
	"#D73C41", "#5E620F", "#00A5E6", "#0F243E",
	"#B9C31E", "#1A5757"
];

trade = {
	"exp":"", "imp":"",
}

tradeFuel = {
	"solid":"", "oil":"" , "gas":"", "bio":"", "electricity":""
}

tradeSiec = {
			"C0000X0350-0370":"","C0100":"","C0110":"","C0121":"","C0129":"","C0200":"","C0210":"","C0220":"","C0311":"","C0320":"","C0330":"","C0340":"","P1100":"","P1200":"",
			"O4000":"", "O4000XBIO":"", "O4100_TOT_4200-4500":"", "O4100_TOT_4200-4500XBIO":"", "O4100_TOT":"", "O4200":"", "O4300":"", "O4400X4410":"", "O4400":"", "O4500":"", "O4600":"", "O4600XBIO":"", "O4620":"", "O4630":"", "O4640":"", "O4651":"", "O4652":"", "O4652XR5210B":"", "O4653":"", "O4661":"", "O4661XR5230B":"", "O4669":"", "O4671":"", "O4671XR5220B":"", "O46711":"", "O46712":"", "O4680":"", "O4681":"", "O4682":"", "O4691":"", "O4692":"", "O4693":"", "O4694":"", "O4695":"", "O4699":"", "R5210B":"", "R5220B":"", "R5230B":"",
			"G3000":"", "G3200":"",
			"R5111":"","R5210P":"","R5210E":"","R5220P":"","R5230P":"","R5290":"",
			"E7000":"", "H8000":"",
}

agreegates = { "TOTAL":"", "NSP":"", "ASI_OTH":"", "ASI_NME_OTH":"", "AFR_OTH":"", "EUR_OTH":"",

}


tradeUnit = {
			"THS_T":"", "MIO_M3":"", "TJ_GCV":"","GWH":"","TJ":""

}

tradeFilter = {
			"all":"","top5":"","top10":"","top25":""
}


codesEntrade = {
	"trade": Object.keys(trade),
	"partner":Object.keys(partner),
	"tradeFuel": Object.keys(tradeFuel),
	"filter": Object.keys(tradeFilter),
	"siec": Object.keys(tradeSiec),
	"time": [],
	"unit": Object.keys(tradeUnit),	
	"geo":Object.keys(geoCountries),	
};

codesDataset = {
	nrg_ti_gas: {
		siec: ["G3000", "G3200"],
		unit: ["MIO_M3", "TJ_GCV"],
		trade: ["imp"],
		defaultUnit: ["TJ_GCV"],
		defaultSiec: ["G3000"],
		fuel:["gas"],
	},
	nrg_ti_sff: {
		siec: ["C0000X0350-0370","C0100","C0110", "C0121","C0129","C0200","C0210","C0220","C0311","C0320","C0330","C0340","P1100","P1200"],
		unit: ["THS_T"],
		trade: ["imp"],
		defaultUnit: ["THS_T"],
		defaultSiec: ["C0000X0350-0370"],	
		fuel:["solid"],	
	},
	nrg_te_sff: {
		siec: ["C0000X0350-0370","C0100","C0110","C0121","C0129","C0200","C0210","C0220","C0311","C0320","C0330","C0340","P1100","P1200"],
		unit: ["THS_T"],
		trade: ["exp"],
		defaultUnit: ["THS_T"],
		defaultSiec: ["C0000X0350-0370"],
		fuel:["solid"],		
	},	
	nrg_ti_oil: {
		siec: ["O4000", "O4000XBIO", "O4100_TOT_4200-4500", "O4100_TOT_4200-4500XBIO", "O4100_TOT", "O4200", "O4300", "O4400X4410", "O4400", "O4500", "O4600", "O4600XBIO", "O4620", "O4630", "O4640", "O4651", "O4652", "O4652XR5210B", "O4653", "O4661", "O4661XR5230B", "O4669", "O4671", "O4671XR5220B", "O46711", "O46712", "O4680", "O4681", "O4682", "O4691", "O4692", "O4693", "O4694", "O4695", "O4699", "R5210B", "R5220B", "R5230B"],
		unit: ["THS_T"],
		trade: ["imp"],
		defaultUnit: ["THS_T"],
		defaultSiec: ["O4000"],	
		fuel:["oil"],	
	},	
	nrg_te_oil: {
		siec: ["O4000", "O4000XBIO", "O4100_TOT_4200-4500", "O4100_TOT_4200-4500XBIO", "O4100_TOT", "O4200", "O4300", "O4400X4410", "O4400", "O4500", "O4600", "O4600XBIO", "O4620", "O4630", "O4640", "O4651", "O4652", "O4652XR5210B", "O4653", "O4661", "O4661XR5230B", "O4669", "O4671", "O4671XR5220B", "O46711", "O46712", "O4680", "O4681", "O4682", "O4691", "O4692", "O4693", "O4694", "O4695", "O4699", "R5210B", "R5220B", "R5230B",],
		unit: ["THS_T"],
		trade: ["exp"],
		defaultUnit: ["THS_T"],
		defaultSiec: ["O4000"],
		fuel:["oil"],
	},

	nrg_te_gas: {
		siec: ["G3000", "G3200"],
		unit: ["MIO_M3", "TJ_GCV"],
		trade: ["exp"],
		defaultUnit: ["TJ_GCV"],
		defaultSiec: ["G3000"],
		fuel:["gas"],
	},
	nrg_ti_bio: {
		siec: ["R5111","R5210P","R5210E","R5220P","R5230P","R5290"],
		unit: ["THS_T"],
		trade: ["imp"],
		defaultUnit: ["THS_T"],
		defaultSiec: ["R5111"],
		fuel:["bio"],
	},	
	nrg_te_bio: {
		siec: ["R5111","R5210P","R5210E","R5220P","R5230P","R5290"],
		unit: ["THS_T"],
		trade: ["exp"],
		defaultUnit: ["THS_T"],
		defaultSiec: ["R5111"],
		fuel:["bio"],
	},	
	nrg_ti_eh: {
		siec: ["E7000", "H8000"],
		unit: ["GWH","TJ"],
		trade: ["imp"],
		defaultUnit: ["GWH"],
		defaultSiec: ["E7000"],
		fuel:["electricity"],
	},
	nrg_te_eh: {
		siec: ["E7000", "H8000"],
		unit: ["GWH","TJ"],
		trade: ["exp"],
		defaultUnit: ["GWH"],
		defaultSiec: ["E7000"],
		fuel:["electricity"],
	},
};


defGeos = ["BE","BG","CZ","DK","DE","EE","IE","EL","ES","FR","HR","IT","CY","LV","LT","LU","HU","MT","NL","AT","PL","PT","RO","SI","SK","FI","SE","IS","LI","NO","ME","MK","AL","RS","TR","BA","XK","MD","UA","GE"]







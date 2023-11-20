/**
 * Returns an array of partners that are available for the given dataset.
 * @param dataset - the dataset to get the partners for.
 * @returns An array of partners that are available for the given dataset.
 */
function availablePartners() {
	partner = "";
    dataset = dataNameSpace.dataset;


switch (dataset) {
    case "nrg_ti_sff":
        // partner = ["AE","AL","AM","AME_OTH","ASI_OTH","AT","AU","AZ","BA","BE","BG","BR","BY","CA","CH","CL","CN","CO","CY","CZ","DE","DK","EC","EE","EL","ES","EUR_OTH","FI","FR","GE","HR","HU","ID","IE","IL","IN","IR","IS","IT","JP","KG","KP","KZ","LT","LU","LV","MD","ME","MK","MT","MX","MY","MZ","NL","NO","NSP","NZ","PE","PK","PL","PT","RO","RS","RU","SA","SE","SG","SI","SK","TJ","TM","TOTAL","TR","UA","UK","US","UZ","VE","VN","XK","ZA",]
        partner = ["AE","AL","AM","AME_OTH","ASI_OTH","AT","AU","AZ","BA","BE","BG","BR","BY","CA","CH","CL","CN","CO","CY","CZ","DE","DK","EC","EE","EL","ES","EUR_OTH","FI","FR","GE","HR","HU","ID","IE","IL","IN","IR","IS","IT","JP","KG","KP","KZ","LT","LU","LV","MD","ME","MK","MT","MX","MY","MZ","NL","NO","NSP","NZ","PE","PK","PL","PT","RO","RS","RU","SA","SE","SG","SI","SK","TJ","TM","TOTAL","TR","UA","UK","US","UZ","VE","VN","XK","ZA"]

        break;
    case "nrg_te_sff":
        partner = ["AE","AFR_OTH","AL","AM","AME_OTH","AR","ASI_NME_OTH","ASI_OTH","AT","AU","AZ","BA","BE","BG","BR","BY","CA","CH","CL","CN","CU","CY","CZ","DE","DK","DZ","EE","EG","EL","ES","EUR_OTH","FI","FR","GE","GH","HK","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KP","KR","KZ","LB","LK","LT","LU","LV","MA","MD","ME","MK","MT","MX","MY","NL","NO","NSP","NZ","PH","PK","PL","PT","RO","RS","RU","SA","SE","SG","SI","SK","SN","SY","TH","TJ","TM","TN","TOTAL","TR","TW","UA","UK","US","UZ","XK","ZA"]
        // partner = ["AE","AFR_OTH","AL","AM","AME_OTH","AR","ASI_NME_OTH","ASI_OTH","AT","AU","AZ","BA","BE","BG","BR","BY","CA","CH","CL","CN","CU","CY","CZ","DE","DK","DZ","EE","EG","EL","ES","EUR_OTH","FI","FR","GE","GH","HK","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KP","KR","KZ","LB","LK","LT","LU","LV","MA","MD","ME","MK","MT","MX","MY","NL","NO","NSP","NZ","PH","PK","PL","TOTAL"]
          
        break;
    case "nrg_ti_oil":
        // partner = ["AE","AFR_OTH","AL","AM","AME_OTH","AO","AR","ASI_NME_OTH","ASI_OTH","AT","AU","AZ","BA","BD","BE","BG","BH","BR","BS","BY","CA","CD","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CW","CY","CZ","DE","DK","DZ","EC","EE","EG","EL","ER","ES","EUR_OTH","EX_SU_OTH","FI","FR","GA","GE","GH","GI","GQ","GT","HK","HN","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JO","JP","KE","KG","KP","KR","KW","KZ","LB","LI","LK","LT","LU","LV","LY","MA","MD","ME","MK","MT","MU","MX","MY","MZ","NA","NG","NL","NO","NSP","NZ","OM","PA","PE","PG","PL","PT","QA","RO","RS","RU","SA","SE","SG","SI","SK","SN","SY","TH","TJ","TM","TN","TOTAL","TR","TT","TW","UA","UG","UK","US","UZ","VE","VN","XK","YE","ZA",]
        partner = ["AE","AFR_OTH","AL","AM","AME_OTH","AO","AR","ASI_NME_OTH","ASI_OTH","AT","AU","AZ","BA","BD","BE","BG","BH","BR","BS","BY","CA","CD","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CW","CY","CZ","DE","DK","DZ","EC","EE","EG","EL","ER","ES","EUR_OTH","EX_SU_OTH","FI","FR","GA","GE","GH","GI","GQ","GT","HK","HN","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JO","JP","KE","KG","KP","KR","KW","KZ","LB","LI","LK","LT","LU","LV","LY","MA","MD","ME","MK","MT","MU","MX","MY","MZ","NA","NG","NL","NO","NSP","NZ","OM","PA","PE","PG","PL","PT","QA","RO","RS","RU","SA","SE","SG","SI","SK","SN","SY","TH","TJ","TM","TN","TOTAL","TR","TT","TW","UA","UG","UK","US","UZ","VE","VN","XK","YE","ZA"]

        break;
    case "nrg_te_oil":
             partner = ["AD","AE","AFR_OTH","AL","AM","AME_OTH","AO","AR","ASI_NME_OTH","ASI_OTH","AT","AU","AW","AZ","BA","BB","BD","BE","BG","BH","BJ","BO","BR","BS","BY","CA","CD","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CW","CY","CZ","DE","DJ","DK","DO","DZ","EC","EE","EG","EL","ER","ES","ET","EUR_OTH","EX_SU_OTH","FI","FR","GA","GE","GH","GI","GQ","GT","GW","HK","HN","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KG","KH","KP","KR","KW","KZ","LB","LK","LR","LT","LU","LV","LY","MA","MD","ME","MG","MH","MK","MM","MN","MR","MT","MU","MX","MY","MZ","NA","NC","NG","NL","NO","NP","NSP","NZ","OM","PA","PE","PG","PH","PK","PL","PT","QA","RO","RS","RU","SA","SD","SE","SG","SI","SK","SL","SN","ST","SY","TG","TH","TJ","TL","TM","TN","TOTAL","TR","TT","TW","TZ","UA","UG","UK","US","UY","UZ","VE","VN","XK","YE","ZA",]

        break;
    case "nrg_ti_gas":
        // partner = ["AE","AO","AT","AU","AZ","BE","BG","BN","CH","CM","CZ","DE","DK","DO","DZ","EC","EG","EL","ES","EX_SU_OTH","FI","FR","GQ","HR","HU","IR","IT","KZ","LT","LU","LY","MT","MY","NG","NL","NO","NSP","OM","PE","PL","PT","QA","RO","RU","SE","SI","SK","TM","TOTAL","TR","TT","UA","UK","US","UZ","YE","ZA",,]
        partner = ["AE","AO","AT","AU","AZ","BE","BG","BN","CH","CM","CZ","DE","DK","DO","DZ","EC","EG","EL","ES","EX_SU_OTH","FI","FR","GQ","HR","HU","IR","IT","KZ","LT","LU","LY","MT","MY","NG","NL","NO","NSP","OM","PE","PL","PT","QA","RO","RU","SE","SI","SK","TM","TOTAL","TR","TT","UA","UK","US","UZ","YE","ZA"]

        break;
    case "nrg_te_gas":
        // partner = ["AD","AE","AFR_OTH","AME_OTH","AR","ASI_NME_OTH","AT","BE","BG","BR","CA","CH","CL","CN","CY","CZ","DE","DK","DO","EE","EG","EL","ES","FI","FR","GI","HR","HU","IE","IL","IN","IT","JP","KR","KW","LT","LU","LV","MD","MK","MX","MY","NL","NO","NSP","PK","PL","PT","QA","RO","RS","RU","SE","SI","SK","TOTAL","TR","TW","UA","UK","US",]
        partner = ["AD","AE","AFR_OTH","AME_OTH","AR","ASI_NME_OTH","AT","BE","BG","BR","CA","CH","CL","CN","CY","CZ","DE","DK","DO","EE","EG","EL","ES","FI","FR","GI","HR","HU","IE","IL","IN","IT","JP","KR","KW","LT","LU","LV","MD","MK","MX","MY","NL","NO","NSP","PK","PL","PT","QA","RO","RS","RU","SE","SI","SK","TOTAL","TR","TW","UA","UK","US"]
       
        break;
    case "nrg_ti_bio":
        partner = ["AE","AFR_OTH","AL","AME_OTH","AR","ASI_NME_OTH","ASI_OTH","AT","AU","BA","BE","BG","BO","BR","BY","CA","CH","CL","CN","CO","CY","CZ","DE","DK","DZ","EE","EG","EL","ES","EUR_OTH","FI","FR","GA","GE","GH","GT","HN","HR","HU","ID","IE","IL","IN","IR","IS","IT","JP","KR","KW","LT","LU","LV","LY","MA","MD","ME","MK","MT","MY","NA","NL","NO","NSP","NZ","OM","PE","PG","PL","PT","RO","RS","RU","SA","SE","SG","SI","SK","TH","TN","TOTAL","TR","TT","UA","UK","US","UY","VE","VN",]
        // partner = ["AE","AFR_OTH","AL","AME_OTH","AR","ASI_NME_OTH","ASI_OTH","AT","AU","BA","BE","BG","BO","BR","BY","CA","CH","CL","CN","CY","CZ","DE","DK","EE","EG","EL","ES","EUR_OTH","FI","FR","GE","GH","HR","HU","ID","IE","IL","IN","IR","IS","IT","JP","KR","LT","LU","LV","MA","MD","ME","MK","MT","MY","NL","NO","NSP","NZ","OM","PL","PT","RO","RS","RU","SE","SI","SK","TH","TN","TOTAL","TR","UA","UK","US","UY","VN"]
        // partner = ["AE","AFR_OTH","AL","AME_OTH","AR","ASI_NME_OTH","ASI_OTH","AT","AU","BA","BE","BG","BO","BR","BY","CA","CH","CL","CN","CO","CY","CZ","DE","DK","DZ","EE","EG","EL","ES","EUR_OTH","FI","FR","GA","GE","GH","GT","HN","HR","HU","ID","IE","IL","IN","IR","IS","IT","JP","KR","KW","LT","LU","LV","LY","MA","MD","ME","MK","MT","MY","NA","NL","NO","NSP","NZ","OM","PE","PG","PL","PT","RO","RS","RU","SA","SE","SG","SI","SK","TH","TN","TOTAL","TR","TT","UA","UK","US","UY","VE","VN","XK",]
        // partner = testpartners()
        break;
    case "nrg_te_bio":
        // partner = ["AD","AE","AFR_OTH","AL","AME_OTH","AO","AR","ASI_NME_OTH","ASI_OTH","AT","AU","AZ","BA","BE","BG","BH","BR","BY","CA","CD","CG","CH","CI","CL","CM","CN","CO","CR","CY","CZ","DE","DJ","DK","DZ","EE","EG","EL","ES","ET","EUR_OTH","FI","FR","GA","GE","GH","GQ","GT","GW","HK","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KP","KR","KW","KZ","LB","LI","LT","LU","LV","LY","MA","MD","ME","MG","MK","MR","MT","MU","MX","MY","MZ","NC","NG","NL","NO","NP","NSP","NZ","OM","PE","PG","PH","PK","PL","PT","QA","RO","RS","RU","SA","SD","SE","SG","SI","SK","SL","SN","TG","TH","TM","TN","TOTAL","TR","TT","TW","TZ","UA","UK","US","UY","UZ","VN","XK","ZA",]
        partner = ["AD","AE","AFR_OTH","AL","AME_OTH","AT","AU","ASI_NME_OTH","ASI_OTH","AZ","BA","BE","BG","BR","BY","CA","CG","CH","CL","CN","CR","CY","CZ","DE","DK","EE","EG","EL","ES","EUR_OTH","FI","FR","GE","HK","HR","HU","ID","IE","IL","IN","IR","IS","IT","JO","JP","KP","KR","KW","KZ","LB","LI","LT","LU","LV","MA","MD","ME","MG","MK","MR","MT","MX","MY","NC","NL","NO","NSP","OM","PH","PK","PL","PT","QA","RO","RS","RU","SA","SE","SG","SI","SK","SN","TH","TM","TN","TOTAL","TR","TT","TW","UA","UK","US","UZ","VN","XK","ZA"]
        
        break;
    case "nrg_ti_eh":
        partner = ["AL","AT","AZ","BA","BE","BG","BY","CH","CZ","DE","DK","EE","EL","ES","FI","FR","GE","HR","HU","IE","IR","IT","LT","LU","LV","MA","MD","ME","MK","MT","NL","NO","NSP","PL","PT","RO","RS","RU","SE","SI","SK","TOTAL","TR","UA","UK",]

        break;
    case "nrg_te_eh":
        // partner = ["AD","AL","AT","AZ","BA","BE","BG","BY","CH","CZ","DE","DK","EE","EL","ES","FI","FR","GE","HR","HU","IE","IT","LI","LT","LU","LV","MA","MD","ME","MK","MT","NL","NO","NSP","PL","PT","RO","RS","RU","SE","SI","SK","SY","TOTAL","TR","UA","UK",]
        partner = ["AD","AL","AT","AZ","BA","BE","BG","BY","CH","CZ","DE","DK","EE","EL","ES","FI","FR","GE","HR","HU","IE","IT","LI","LT","LU","LV","MA","MD","ME","MK","MT","NL","NO","NSP","PL","PT","RO","RS","RU","SE","SI","SK","SY","TOTAL","TR","UA","UK"]

        break;
    default:
      
}
	return partner
};



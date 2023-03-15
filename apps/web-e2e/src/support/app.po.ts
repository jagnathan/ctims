const getVisitUrl = () => cy.visit(Cypress.env('baseUrl'),{timeout: 10000})
const signInButton = () => cy.get('.p-button')
const createCTMLButton = () => cy.get('.p-button')

//TrialEditor Header
export const trialEditorHeader = () => cy.get('.EditorTopBar_title__kDE8R')

//TrialEditor Buttons (Discard, Export, Save)
export const trialEditorHeaderButtons = () => cy.get('.EditorTopBar_menuBtnGroup__dBNyO>button') //3 elements

//LeftPanel Trial Editor
export const trialEditorLeftPanelList = () => cy.get('.LeftMenuEditorComponent_ctims-nav__sI_UW>ul>li') //8 elements

//Trial Information
export const getTrialId = () => cy.get('#root_trialInformation_trial_id');
export const getTrialNickname = () => cy.get('#root_trialInformation_nickname');
export const getPrincipalInvestigator = () => cy.get('#root_trialInformation_principal_investigator')
export const getLongTitle = () => cy.get('#root_trialInformation_long_title')
export const getShortTitle = () => cy.get('#root_trialInformation_short_title')
export const getProtocolNumber = () => cy.get('#root_trialInformation_protocol_no')
export const getNCTPurpose = () => cy.get('#root_trialInformation_nct_purpose')

//Dropdown button for Ctml Status
const clickCtmlStatusDropdown = () => cy.get('#root_trialInformation_ctml_status > .p-dropdown-trigger').click();
export const getCtmlStatusDropdown = () => cy.get('#root_trialInformation_ctml_status > .p-dropdown-trigger');
export const getCtmlStatusDropdownList = () => cy.get('.p-dropdown-items-wrapper>ul>li');
const selectCtmlStatus = () => cy.get('[aria-label="Draft"]').click();

//Dropdown for Phase
export const getClickPhase = () => cy.get('#root_trialInformation_phase')
export const getPhaseDropdownList = () => cy.get('.p-dropdown-items-wrapper>ul>li') //list all the 4 phases, select
// according
// to requirements

export const selectDraftCtmlStatus = () => {
  clickCtmlStatusDropdown();
  selectCtmlStatus();
}
//default icon list
export const getAllPanelHeaderTop = () => cy.get('.ctimsPanelHeaderTop') //contains 6 header starts with "Drug1"
//default plus icon in drug list-1, management group list-1, site list-1, sponsor list-1, staff list-1, treatment list-3
export const getPlusIcon = () => cy.get('.pi.pi-plus-circle') //contains 8 elements
export const getTrashIcon = () => cy.get('.pi.pi-trash') //contains 8 elements
export const getTogglerButton = () => cy.get('.pi.pi-trash') //contains 9 elements(up/down)
//Default checkbox in management group-1, site list--2, sponsor-1,arm-1, dose level -1
export const getCheckBoxIcon = () => cy.get('.p-checkbox') //contains 6 elements as default
export const getCheckBoxPrimaryManagementGroup = () => cy.get('#object-field-template-root_management_group_list_management_group_0>div:nth-child(2)>div>div>.p-checkbox')
export const getCheckBoxCoordinateCenter = () => cy.get('#object-field-template-root_site_list_site_0>div:nth-child(3)>div>div>.p-checkbox')
export const getCheckBoxCancerCenterIRB = () => cy.get('#object-field-template-root_site_list_site_0>div:nth-child(4)>div>div>.p-checkbox')
export const getCheckBoxPrincipalSponsor = () => cy.get('#object-field-template-root_sponsor_list_sponsor_0>div:nth-child(2)>div>div>.p-checkbox')
export const getCheckBoxArmIsSuspended = () => cy.get('#object-field-template-root_treatment_list_step_0_arm_0>div:nth-child(4)>div>div>.p-checkbox')
export const getCheckBoxLevelIsSuspended = () => cy.get('#object-field-template-root_treatment_list_step_0_arm_0_dose_level_0>div:nth-child(4)>div>div>.p-checkbox')


//Age
export const getAgeGroup = () => cy.get('#root_age_group_age')

//Drug List
export const getDrugName = () => cy.get('#root_drugList_drug_0_drug_name')

//Management Group List
export const getManagementGroupName = () => cy.get('#root_management_group_list_management_group_0_management_group_name')

//Site List
export const getSiteName = () => cy.get('#root_site_list_site_0_site_name')
export const getSiteStatus = () => cy.get('#root_site_list_site_0_site_status')

//Sponsor List
export const getSponsorName = () => cy.get('#root_sponsor_list_sponsor_0_sponsor_name')

//Staff List
export const getProtocolStaffFirstName = () => cy.get('#root_staff_list_protocol_staff_0_first_name')
export const getProtocolStaffLastName = () => cy.get('#root_staff_list_protocol_staff_0_last_name')
export const getProtocolStaffEmail = () => cy.get('#root_staff_list_protocol_staff_0_email')
export const getProtocolStaffInstitutionalName = () => cy.get('#root_staff_list_protocol_staff_0_institution_name')
export const getProtocolStaffRole = () => cy.get('#root_staff_list_protocol_staff_0_staff_role')
export const getProtocolStaffStatus = () => cy.get('#root_staff_list_protocol_staff_0_status')

//Treatment List
//Step1
//Arm1
export const getArmCode = () => cy.get('#root_treatment_list_step_0_arm_0_arm_code')
export const getArmDescription = () => cy.get('#root_treatment_list_step_0_arm_0_arm_description')
export const getArmInternalId = () => cy.get('#root_treatment_list_step_0_arm_0_arm_internal_id')
//DOSE_LEVEL 1
export const getLevelCode = () => cy.get('#root_treatment_list_step_0_arm_0_dose_level_0_level_code')
export const getLevelDescription = () => cy.get('#root_treatment_list_step_0_arm_0_dose_level_0_level_description')
export const getLevelInternalId = () => cy.get('#root_treatment_list_step_0_arm_0_dose_level_0_level_internal_id')

//Edit Matching Criteria
export const getEditMatchingCriteria = () => cy.get('.CtimsMatchingCriteriaWidget_edit-matching-criteria-title__qEaKg')

//******************* Match Modal Criteria ********************************************************//

//Footer Buttons("Discard", "Save matching criteria")
export const getFooterButtons = () => cy.get('.p-dialog-footer>div>button') //2 elements

//Match Criteria Default Text
export const getDefaultTextMatchingCriteria = () => cy.get('.MatchingMenuAndForm_matchingCriteriaFormContainerEmptyText__6I4Dm')

//Add criteria group component
export const getAddCriteriaGroup = () => cy.get('.MatchingMenuAndForm_addCriteriaBtn___mgY1')

//LeftMenuComponent(span-->.p-treenode-label and button--> p-button(click on button to add criteria)
export const getLeftMenuComponent = () => cy.get('.LeftMenuComponent_treeNodeContainer__K7jg6')

//Truncate button
export const getTruncateButton = () => cy.get('.p-button.p-component.LeftMenuComponent_treeMenuBtn__zRCgR.p-button-icon-only')

//Add criteria list of options
export const getAddCriteriaList = () => cy.get('.p-tieredmenu>ul>li')

//Add criteria to same group
export const getAddCriteriaToSameGroup = () => cy.get('.p-tieredmenu>ul>li:nth-child(1)')

//Switch group operator
export const getSwitchGroupOperator = () => cy.get('.p-tieredmenu>ul>li:nth-child(2)')

//Delete
export const getDelete = () => cy.get('.p-tieredmenu>ul>li:nth-child(3)')

//Add criteria to Subgroup
export const getAddCriteriaToSubGroup = () => cy.get('.p-tieredmenu>ul>li:nth-child(5)')

//Clinical at child(1) and genomic at child(2)
export const getMenuItemClinicalGenomic = () => cy.get('.p-tieredmenu>ul>li:nth-child(1)>ul>li') //2 elements

//Clinical at child(3) and genomic at child(4)
  export const getMenuItemAnd = () => cy.get('.p-tieredmenu>ul>li:nth-child(5)>ul>li:nth-child(1)')
export const getMenuItemOr = () => cy.get('.p-submenu-list>li:nth-child(2)>a')

//Operator
export const getOperator = () => cy.get('.p-inputwrapper-filled') //do a click action

//Operator dropdown
export const getOperatorDropDown = () => cy.get('.p-dropdown-panel>div>ul>li') //2 elements

//Clinical dropdown
export const getClinicalDropdown = () => cy.get('.p-dropdown-panel>div>ul>li') //all have 2 drop downs

//******************* Genomic ********************************************************//

//Hugo Symbol
export const getHugoSymbol = () => cy.get('#root_hugo_symbol')

//Variant Category
export const getVariantCategory = () => cy.get('#root_variant_category')

//Protein Change
export const getProteinChange = () => cy.get('#root_protein_change')

//Variant Classification
export const getVariantClassification = () => cy.get('#root_variant_classification')

//CNV Call
export const getCNVCall = () => cy.get('#root_cnv_call')

//Fusion Partner Hugo Symbol
export const getFusionPartnerHugoSymbol = () => cy.get('#root_fusion_partner_hugo_symbol')

//True Transcript Exon
export const getTrueTranscriptExon = () => cy.get('#root_true_transcript_exon')

//Wildtype
export const getWildType = () => cy.get('#root_wildtype')

//POLE Status
export const getPoleStatus = () => cy.get('#root_pole_status')

//UVA Status
export const getUVAStatus = () => cy.get('#root_uva_status')

//Tobacco Status
export const getTobaccoStatus = () => cy.get('#root_tobacco_status')

//APOBEC Status
export const getApobecStatus = () => cy.get('#root_apobec_status')

//Temozolomide Status
export const getTemozolomideStatus = () => cy.get('#root_temozolomide_status')

//MMR Status
export const getMMRStatus = () => cy.get('#root_mmr_status')

//MS Status
export const getMSStatus = () => cy.get('#root_ms_status')

//genericDropdownList
export const getGenomicDropDown = () => cy.get('.p-dropdown-panel>div>ul>li')


//******************* Clinical ********************************************************//









import type { QuestionDifficulty } from "../../models/Question";

export interface SeedBarQuestion {
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  prompt: string;
  sourceTitle: string;
  sourceUrl: string;
}

export const BAR_QUESTIONS_SEED: SeedBarQuestion[] = [
  {
    subject: "Political Law",
    topic: "Bill of Rights - Warrantless Search",
    difficulty: "medium",
    tags: ["bill-of-rights", "search-and-seizure", "criminal-procedure"],
    prompt:
      "Police officers received an anonymous tip that Carlo kept illegal firearms in his apartment. Without obtaining a warrant, officers went to the unit, knocked, and told Carlo they only needed to ask a few questions. Carlo opened the door slightly; an officer then pushed the door open, entered, and saw a rifle on a table. Carlo was arrested and charged. As defense counsel, discuss whether the rifle is admissible in evidence and whether any recognized exception to the warrant requirement applies. Explain fully under Philippine constitutional law and jurisprudence.",
    sourceTitle: "1987 Constitution, Article III; Rule 126, Rules of Court",
    sourceUrl: "https://lawphil.net/consti/cons1987.html",
  },
  {
    subject: "Political Law",
    topic: "Constitutional Law - Equal Protection",
    difficulty: "easy",
    tags: ["equal-protection", "classification", "local-ordinance"],
    prompt:
      "A city ordinance grants a tax discount to all business owners who are city-born residents, but denies the same benefit to long-time residents born elsewhere. A group of affected business owners challenges the ordinance as unconstitutional. Resolve the issue and discuss the requisites of a valid classification under the equal protection clause. Apply each requisite to the ordinance.",
    sourceTitle: "1987 Constitution, Article III, Section 1",
    sourceUrl: "https://lawphil.net/consti/cons1987.html",
  },
  {
    subject: "Civil Law",
    topic: "Obligations and Contracts - Delay and Damages",
    difficulty: "medium",
    tags: ["obligations", "delay", "damages"],
    prompt:
      "Dina contracted to deliver 500 sacks of cement to Marco on 1 June, payment upon delivery. On 30 May, Dina informed Marco she would deliver on 15 June because she accepted another buyer's higher offer. Marco sent a written demand for timely delivery. Dina still failed to deliver on 1 June, causing Marco to miss his own construction deadline. Discuss Marco's remedies, including specific performance, rescission, and damages, under the Civil Code.",
    sourceTitle: "Civil Code of the Philippines, Book IV",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Civil Law",
    topic: "Property - Double Sale",
    difficulty: "hard",
    tags: ["property", "double-sale", "registration"],
    prompt:
      "Lito sold the same parcel of registered land to Ana on 5 January and later to Ben on 20 January. Ana immediately took possession but did not register the sale. Ben knew of Ana's possession but nevertheless registered his deed first. Ana sues to recover ownership. Resolve who has better right under the Civil Code and land registration principles, and explain the role of good faith.",
    sourceTitle: "Civil Code provisions on double sale; Property Registration Decree",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Criminal Law",
    topic: "Justifying Circumstances - Self-Defense",
    difficulty: "easy",
    tags: ["self-defense", "rpc", "justifying-circumstances"],
    prompt:
      "During an argument outside a store, Victor pulled out a knife and lunged at Ramon. Ramon grabbed a metal pipe and struck Victor once on the head, causing Victor's death. Witnesses disagree whether Victor had already stepped back when Ramon struck him. Ramon is charged with homicide and invokes self-defense. Discuss the requisites of complete and incomplete self-defense and how the burden of evidence operates.",
    sourceTitle: "Revised Penal Code, Article 11",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Criminal Law",
    topic: "Crimes Against Property - Estafa",
    difficulty: "medium",
    tags: ["estafa", "misappropriation", "rpc"],
    prompt:
      "Nina received P2,000,000 from Omar to purchase medical equipment on his behalf. Instead, Nina used the money to pay her personal debts and later claimed the supplier cancelled the order. Omar filed a criminal complaint. Nina argues this is only a civil breach of contract. Distinguish estafa from mere non-performance of an obligation and determine Nina's criminal liability.",
    sourceTitle: "Revised Penal Code, Article 315",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Labor Law",
    topic: "Termination - Just Cause",
    difficulty: "medium",
    tags: ["termination", "due-process", "just-cause"],
    prompt:
      "A logistics company dismissed Paula for allegedly stealing fuel. The company issued a notice to explain, gave her 24 hours to respond, and terminated her two days later without hearing because she denied the accusation. Paula files an illegal dismissal case. Discuss both substantive and procedural due process requirements for valid dismissal and the consequences if only one requirement is met.",
    sourceTitle: "Labor Code of the Philippines",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Labor Law",
    topic: "Wages - Diminution of Benefits",
    difficulty: "hard",
    tags: ["wages", "benefits", "non-diminution"],
    prompt:
      "For eight years, a manufacturing firm granted a transportation allowance to all rank-and-file employees every payday. Citing losses, management unilaterally stopped the allowance and called it a discretionary grant. Employees challenge the action. Discuss the rule on non-diminution of benefits and the exceptions recognized in labor law.",
    sourceTitle: "Labor Code; DOLE issuances on wage and benefits protection",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Taxation Law",
    topic: "National Internal Revenue Tax - VAT",
    difficulty: "easy",
    tags: ["vat", "refund", "zero-rated-sales"],
    prompt:
      "A Philippine VAT-registered exporter made zero-rated sales for four quarters and filed an administrative claim for VAT refund beyond the period required by law. It later filed a judicial claim and argued substantial compliance. As counsel for the government, discuss whether the claims should prosper and the nature of VAT refund periods.",
    sourceTitle: "National Internal Revenue Code; VAT refund provisions",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Local Taxation - Ordinance Validity",
    difficulty: "medium",
    tags: ["local-tax", "lgu", "uniformity"],
    prompt:
      "A municipality imposed a local business tax that applies only to online sellers but exempts all physical stores engaged in the same goods. A taxpayer challenges the ordinance for violating constitutional and statutory limitations on local taxation. Resolve the challenge and discuss uniformity, reasonableness, and authority of local governments to tax.",
    sourceTitle: "Local Government Code of 1991",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html",
  },
  {
    subject: "Remedial Law",
    topic: "Civil Procedure - Jurisdiction and Venue",
    difficulty: "easy",
    tags: ["jurisdiction", "venue", "civil-procedure"],
    prompt:
      "Rico filed an action for reconveyance of land valued at P4,500,000 before the Municipal Trial Court where the defendant resides, rather than where the land is located. The defendant moves to dismiss for lack of jurisdiction and improper venue. Rule on both grounds and explain the distinction between jurisdiction and venue in civil actions.",
    sourceTitle: "Rules of Court - Rule 4 and jurisdiction statutes",
    sourceUrl: "https://lawphil.net/courts/rules/rc_1-71_civil.html",
  },
  {
    subject: "Remedial Law",
    topic: "Evidence - Hearsay Rule",
    difficulty: "medium",
    tags: ["evidence", "hearsay", "exceptions"],
    prompt:
      "In a civil damages case, plaintiff offers a written statement of a witness who has since migrated abroad and cannot be compelled to appear. Defendant objects on hearsay grounds. Plaintiff invokes necessity and fairness. Discuss whether the statement may be admitted, what hearsay exceptions may apply, and the foundational requirements for each.",
    sourceTitle: "Rules on Evidence",
    sourceUrl: "https://lawphil.net/courts/rules/rc_128-133_evidence.html",
  },
  {
    subject: "Commercial Law",
    topic: "Corporation Law - Separate Juridical Personality",
    difficulty: "medium",
    tags: ["corporation", "piercing-the-veil", "obligations"],
    prompt:
      "Delta Holdings, Inc. failed to pay suppliers. The suppliers sue both the corporation and its president, alleging he used corporate funds for personal expenses and transferred assets to another company he wholly owns. Discuss when courts may pierce the corporate veil and hold corporate officers personally liable.",
    sourceTitle: "Revised Corporation Code",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2019/ra_11232_2019.html",
  },
  {
    subject: "Commercial Law",
    topic: "Negotiable Instruments - Holder in Due Course",
    difficulty: "hard",
    tags: ["negotiable-instruments", "hidc", "defenses"],
    prompt:
      "Leo issued a check payable to Maya for goods that were never delivered. Maya indorsed the check to Nestor, who accepted it as payment of Maya's prior debt and claims holder-in-due-course status. Leo refuses payment and raises failure of consideration. Resolve whether Nestor is a holder in due course and whether Leo's defense is available against him.",
    sourceTitle: "Negotiable Instruments Law",
    sourceUrl: "https://lawphil.net/statutes/acts/act_2031_1911.html",
  },
  {
    subject: "Legal Ethics",
    topic: "Conflict of Interest",
    difficulty: "easy",
    tags: ["legal-ethics", "conflict", "lawyer-duty"],
    prompt:
      "A lawyer represented a corporation in negotiating a lease. After resigning from the firm, the same lawyer accepted engagement from the lessor in a suit to rescind that same lease, arguing he would not use confidential information. The corporation seeks his disqualification. Discuss the conflict-of-interest rule and whether disqualification is proper.",
    sourceTitle: "Code of Professional Responsibility and Accountability",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Legal Ethics",
    topic: "Lawyer Discipline - Notarial Misconduct",
    difficulty: "medium",
    tags: ["legal-ethics", "notarial-law", "discipline"],
    prompt:
      "A notary public notarized a deed of sale without the personal appearance of one signatory and without checking competent evidence of identity. The deed was later used in litigation. A complaint was filed with the IBP. Discuss the lawyer's possible administrative liability and sanctions, including the effect on notarial commission and bar membership.",
    sourceTitle: "2004 Rules on Notarial Practice; CPRA",
    sourceUrl: "https://lawphil.net/courts/supreme/am/am_02-8-13-sc_2004.html",
  },
  {
    subject: "Political Law",
    topic: "Constitutional Commissions - Independence",
    difficulty: "medium",
    tags: ["constitutional-commissions", "civil-service", "independence"],
    prompt:
      "The head of an executive department issued a circular requiring all agencies, including the Civil Service Commission, to secure prior department approval before hiring consultants and releasing consultant fees. The CSC refused to comply and cited constitutional independence. Resolve the dispute and explain the scope of fiscal and administrative autonomy of constitutional commissions.",
    sourceTitle: "1987 Constitution, provisions on Constitutional Commissions",
    sourceUrl: "https://lawphil.net/consti/cons1987.html",
  },
  {
    subject: "Political Law",
    topic: "Judicial Review - Actual Case or Controversy",
    difficulty: "hard",
    tags: ["judicial-review", "locus-standi", "ripeness"],
    prompt:
      "Congress passed a statute authorizing mandatory collection of biometric data from all social media users, but implementing rules have not yet been issued. A citizen group files a petition directly with the Supreme Court to declare the statute unconstitutional. Discuss whether the petition is ripe for judicial review and whether standing requirements may be relaxed.",
    sourceTitle: "1987 Constitution, Article VIII; jurisprudence on judicial review",
    sourceUrl: "https://lawphil.net/consti/cons1987.html",
  },
  {
    subject: "Political Law",
    topic: "Administrative Law - Exhaustion of Remedies",
    difficulty: "easy",
    tags: ["administrative-law", "exhaustion", "exceptions"],
    prompt:
      "A public school teacher was reassigned by the regional office and immediately filed a petition in court to nullify the reassignment for grave abuse. The Solicitor General argues the case should be dismissed for failure to exhaust administrative remedies. Rule on the objection and discuss recognized exceptions to the doctrine.",
    sourceTitle: "Administrative law doctrines and Rules of Court",
    sourceUrl: "https://lawphil.net/courts/rules/rc_1-71_civil.html",
  },
  {
    subject: "Political Law",
    topic: "Local Government - Recall Elections",
    difficulty: "medium",
    tags: ["local-government", "recall", "election-law"],
    prompt:
      "A recall petition against a municipal mayor was filed within the first year of office but the COMELEC scheduled the recall vote during the election ban period under the Local Government Code. Supporters insist the vote should proceed as scheduled. Discuss the validity of the recall process and timing limitations under election and local government law.",
    sourceTitle: "Local Government Code; Omnibus Election Code",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html",
  },
  {
    subject: "Civil Law",
    topic: "Family Relations - Void Marriages",
    difficulty: "easy",
    tags: ["family-code", "void-marriage", "property-relations"],
    prompt:
      "Jose married Lina in 2010. In 2018, Lina discovered that Jose had a prior subsisting marriage that was never annulled. Lina now seeks declaration of nullity and asks whether she may recover properties acquired during their union. Discuss the legal effects of a void marriage and the applicable property regime.",
    sourceTitle: "Family Code of the Philippines",
    sourceUrl: "https://lawphil.net/executive/execord/eo1987/eo_209_1987.html",
  },
  {
    subject: "Civil Law",
    topic: "Sales - Hidden Defects",
    difficulty: "medium",
    tags: ["sales", "warranty", "hidden-defects"],
    prompt:
      "Ria purchased a second-hand delivery van from Paolo after test-driving it. One month later, the engine failed due to a long-standing internal defect that mechanics said existed before the sale and was not discoverable by ordinary inspection. Ria seeks rescission and damages. Discuss her remedies under the Civil Code and the period for enforcing them.",
    sourceTitle: "Civil Code provisions on sales and warranties",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Civil Law",
    topic: "Succession - Legitimes",
    difficulty: "hard",
    tags: ["succession", "legitime", "preterition"],
    prompt:
      "Teresa executed a will instituting her eldest son as sole heir and leaving no share to her two legitimate daughters. Upon her death, the son claims complete ownership over all estate assets based on the will. The daughters contest distribution. Discuss preterition, impairment of legitime, and the proper settlement of the estate under Philippine succession law.",
    sourceTitle: "Civil Code, Book III on Succession",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Civil Law",
    topic: "Agency - Authority and Ratification",
    difficulty: "medium",
    tags: ["agency", "authority", "ratification"],
    prompt:
      "Mila authorized her broker in writing to sell her condominium for not less than P6 million cash. The broker sold it for P5.5 million with installment terms and signed in Mila's name. Mila refused to honor the sale, but later accepted one installment from the buyer while negotiating alternatives. Discuss whether a binding sale exists and whether ratification occurred.",
    sourceTitle: "Civil Code provisions on Agency",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Criminal Law",
    topic: "Stages of Execution - Attempted vs Frustrated",
    difficulty: "medium",
    tags: ["stages-of-crime", "attempted", "frustrated"],
    prompt:
      "Gino fired one shot at Paulo from close range intending to kill him. The bullet hit Paulo's shoulder, but doctors testified the wound was not fatal and Paulo was discharged after treatment. Gino is charged with frustrated homicide. Determine the proper stage of execution and explain the elements distinguishing attempted and frustrated felonies.",
    sourceTitle: "Revised Penal Code, Articles 6 and related provisions",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Criminal Law",
    topic: "Complex Crimes",
    difficulty: "hard",
    tags: ["complex-crime", "rpc", "penalties"],
    prompt:
      "While fleeing from police after a robbery, Tomas fired repeatedly at pursuing officers, killing one and injuring another. Prosecutors charged him with separate crimes of robbery, homicide, and serious physical injuries. Tomas argues that only one complex crime should be filed. Discuss when a complex crime exists, and the proper charging and penalty framework.",
    sourceTitle: "Revised Penal Code, Article 48",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Criminal Law",
    topic: "Special Penal Laws - Cybercrime",
    difficulty: "easy",
    tags: ["cybercrime", "libel", "special-laws"],
    prompt:
      "A blogger posted an accusation on social media that a local doctor fabricated medical results, causing reputational harm. The post remained online for several months and was repeatedly shared. A complaint for cyber libel was filed. Discuss the elements of cyber libel, venue concerns, and available defenses based on free speech and fair comment.",
    sourceTitle: "Cybercrime Prevention Act of 2012",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2012/ra_10175_2012.html",
  },
  {
    subject: "Criminal Law",
    topic: "Penalty Computation - Indeterminate Sentence Law",
    difficulty: "medium",
    tags: ["isl", "penalties", "criminal-law"],
    prompt:
      "Mara was convicted of a felony punishable by prision correccional maximum to prision mayor minimum. No modifying circumstances were appreciated. The trial court imposed a straight penalty without fixing a minimum and maximum term. Discuss the proper application of the Indeterminate Sentence Law and how to compute the penalty range.",
    sourceTitle: "Indeterminate Sentence Law; Revised Penal Code",
    sourceUrl: "https://lawphil.net/statutes/acts/act_4103_1933.html",
  },
  {
    subject: "Labor Law",
    topic: "Probationary Employment",
    difficulty: "easy",
    tags: ["probationary", "standards", "labor-standards"],
    prompt:
      "A call center hired Janine as a probationary employee for six months but did not communicate performance standards at engagement. Near the end of the period, Janine was terminated for failure to meet metrics she first learned about in her fifth month. She files an illegal dismissal complaint. Resolve the case under probationary employment rules.",
    sourceTitle: "Labor Code and implementing rules on probationary employment",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Labor Law",
    topic: "Contracting and Subcontracting",
    difficulty: "hard",
    tags: ["contracting", "labor-only", "principal-contractor"],
    prompt:
      "A retail chain engaged Prime Services, which supplied cashiers assigned exclusively in the chain's stores. Prime had minimal capitalization and no independent business equipment, while store managers controlled daily cashier schedules and discipline. Dismissed cashiers seek regularization with the retail chain. Discuss whether labor-only contracting exists and the liabilities of principal and contractor.",
    sourceTitle: "Labor Code; DOLE rules on contracting",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Labor Law",
    topic: "Authorized Causes - Redundancy",
    difficulty: "medium",
    tags: ["redundancy", "authorized-cause", "separation-pay"],
    prompt:
      "A software firm declared redundancy affecting 30 programmers, citing automation. It gave one-month notice to DOLE and employees, paid separation benefits, but retained recently hired programmers with similar functions. Affected workers challenge the redundancy as invalid. Discuss substantive tests for valid redundancy and reliefs if dismissal is illegal.",
    sourceTitle: "Labor Code provisions on authorized causes",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Labor Law",
    topic: "Union Rights and Unfair Labor Practice",
    difficulty: "medium",
    tags: ["ulp", "union", "collective-bargaining"],
    prompt:
      "After employees formed a union, management transferred union officers to distant branches and suspended one officer for allegedly violating a dress code policy previously unenforced. The union files a complaint for unfair labor practice. Discuss the elements of ULP and assess management's actions under labor relations principles.",
    sourceTitle: "Labor Code provisions on labor relations",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Taxation Law",
    topic: "Income Tax - Situs and Residency",
    difficulty: "medium",
    tags: ["income-tax", "residency", "situs"],
    prompt:
      "Paolo, a Filipino citizen working abroad for most of the year, earned salary from a foreign employer and rental income from a Philippine condominium. In his return, he excluded all income, claiming non-resident status. The BIR assessed deficiency tax. Discuss the taxability of each income item and the residency/situs rules applicable.",
    sourceTitle: "National Internal Revenue Code, income tax provisions",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Tax Remedies - Assessment and Protest",
    difficulty: "hard",
    tags: ["tax-remedies", "assessment", "protest"],
    prompt:
      "The BIR served a Final Assessment Notice and Formal Letter of Demand by leaving copies with a security guard at the taxpayer's old office despite prior notice of transfer to a new address. The taxpayer learned of the assessment only after receiving a warrant of distraint. Discuss whether the assessment became final and executory, and the remedies available.",
    sourceTitle: "NIRC provisions on assessment and collection",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Donor's Tax",
    difficulty: "easy",
    tags: ["donors-tax", "gratuitous-transfer", "nirc"],
    prompt:
      "Elena transferred a condominium unit to her niece for P500,000 despite a zonal value of P3,000,000, and stated in the deed that the transfer was out of love and affection. BIR assessed donor's tax on the difference. Elena argues it was a valid sale. Discuss when a transfer is deemed a donation and the tax consequences.",
    sourceTitle: "NIRC provisions on donor's tax",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Real Property Tax",
    difficulty: "medium",
    tags: ["real-property-tax", "lgu", "exemptions"],
    prompt:
      "A non-stock educational institution leased part of its campus to commercial food stalls and parking operators. The city assessor imposed real property tax on the leased areas and on the whole campus buildings. The institution claims full exemption. Resolve the extent of exemption and discuss tests used in determining taxability.",
    sourceTitle: "1987 Constitution; Local Government Code real property tax rules",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html",
  },
  {
    subject: "Remedial Law",
    topic: "Special Civil Actions - Certiorari",
    difficulty: "medium",
    tags: ["certiorari", "grave-abuse", "rule-65"],
    prompt:
      "A trial court denied a motion to dismiss and set the case for trial. Instead of filing an answer, defendant filed a petition for certiorari alleging grave abuse of discretion. Plaintiff moved to dismiss the petition, arguing ordinary appeal and trial remedies are available. Discuss the requisites of certiorari and whether the petition should prosper.",
    sourceTitle: "Rules of Court, Rule 65",
    sourceUrl: "https://lawphil.net/courts/rules/rc_1-71_civil.html",
  },
  {
    subject: "Remedial Law",
    topic: "Criminal Procedure - Bail",
    difficulty: "hard",
    tags: ["bail", "criminal-procedure", "capital-offense"],
    prompt:
      "Ana was charged with an offense punishable by reclusion perpetua. She applied for bail before arraignment. The prosecution sought deferment, claiming it still needed to gather evidence. The court granted bail without hearing prosecution evidence. The prosecution questions the order. Discuss the constitutional and procedural rules governing bail in this situation.",
    sourceTitle: "1987 Constitution; Rules of Criminal Procedure",
    sourceUrl: "https://lawphil.net/courts/rules/rc_110-127_criminal.html",
  },
  {
    subject: "Remedial Law",
    topic: "Provisional Remedies - Preliminary Injunction",
    difficulty: "easy",
    tags: ["injunction", "provisional-remedies", "irreparable-injury"],
    prompt:
      "A homeowner filed suit to stop demolition of a structure allegedly built beyond an easement line. The trial court issued a temporary restraining order and later a writ of preliminary injunction without requiring a bond from the applicant. The defendant challenges the writ. Discuss requisites for preliminary injunction and the role of injunction bond.",
    sourceTitle: "Rules of Court, Rule 58",
    sourceUrl: "https://lawphil.net/courts/rules/rc_1-71_civil.html",
  },
  {
    subject: "Remedial Law",
    topic: "Evidence - Documentary Authentication",
    difficulty: "medium",
    tags: ["evidence", "documents", "authentication"],
    prompt:
      "In a contract case, plaintiff offers photocopies of invoices and receipts, claiming the originals were lost in a flood. Defendant objects and argues the best evidence rule bars admission. Discuss when secondary evidence of document contents may be admitted and what foundational proof is required before admission.",
    sourceTitle: "Rules on Evidence; Best Evidence Rule",
    sourceUrl: "https://lawphil.net/courts/rules/rc_128-133_evidence.html",
  },
  {
    subject: "Commercial Law",
    topic: "Insurance - Insurable Interest",
    difficulty: "easy",
    tags: ["insurance", "insurable-interest", "policy-validity"],
    prompt:
      "Rogelio procured a fire insurance policy over a warehouse owned by his friend, claiming he had verbal authority to insure it. The warehouse burned down, and Rogelio claimed policy proceeds. The insurer denied liability for lack of insurable interest. Discuss whether the policy is enforceable and when insurable interest must exist.",
    sourceTitle: "Insurance Code of the Philippines",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1978/pd_1460_1978.html",
  },
  {
    subject: "Commercial Law",
    topic: "Securities Regulation - Insider Trading",
    difficulty: "hard",
    tags: ["securities", "insider-trading", "market-disclosure"],
    prompt:
      "Before public disclosure of a major merger, a finance manager purchased shares of his company through his brother's brokerage account and sold them after the announcement at a substantial gain. The SEC initiated enforcement action. Discuss elements of insider trading and potential liabilities of both the insider and the nominee trader.",
    sourceTitle: "Securities Regulation Code",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2000/ra_8799_2000.html",
  },
  {
    subject: "Commercial Law",
    topic: "Banking - Secrecy of Bank Deposits",
    difficulty: "medium",
    tags: ["banking", "bank-secrecy", "exceptions"],
    prompt:
      "In a civil collection case, plaintiff sought production of defendant's savings account records to prove concealed assets. The bank refused and cited bank secrecy. Plaintiff argues records are necessary to enforce court judgment. Discuss the general rule on confidentiality of deposits and statutory exceptions that may allow disclosure.",
    sourceTitle: "Bank Secrecy Law and related statutes",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1955/ra_1405_1955.html",
  },
  {
    subject: "Commercial Law",
    topic: "Rehabilitation and Insolvency",
    difficulty: "medium",
    tags: ["insolvency", "rehabilitation", "stay-order"],
    prompt:
      "A corporation filed a petition for rehabilitation and obtained a stay order. A secured creditor proceeded with extrajudicial foreclosure, claiming its mortgage right cannot be impaired. The corporation moved to nullify foreclosure. Discuss the effect of rehabilitation stay orders on secured claims and the rationale behind rehabilitation proceedings.",
    sourceTitle: "Financial Rehabilitation and Insolvency Act",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2010/ra_10142_2010.html",
  },
  {
    subject: "Legal Ethics",
    topic: "Attorney-Client Privilege",
    difficulty: "medium",
    tags: ["privilege", "confidentiality", "legal-ethics"],
    prompt:
      "During trial, a lawyer was asked to testify about statements made by a former client concerning hidden assets. The lawyer argued attorney-client privilege, while opposing counsel claimed an exception because the statements were allegedly made to plan fraud. Discuss the requisites of privileged communication and the crime-fraud exception.",
    sourceTitle: "Rules on Evidence; CPRA confidentiality duties",
    sourceUrl: "https://lawphil.net/courts/rules/rc_128-133_evidence.html",
  },
  {
    subject: "Legal Ethics",
    topic: "Lawyer Advertising and Solicitation",
    difficulty: "easy",
    tags: ["advertising", "solicitation", "professional-responsibility"],
    prompt:
      "A law firm ran social media ads stating it guarantees acquittal in criminal cases and posted clients' before-and-after legal outcomes without written consent. A complaint was filed for unethical advertising and solicitation. Discuss ethical limits on legal marketing and possible disciplinary consequences.",
    sourceTitle: "Code of Professional Responsibility and Accountability",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Legal Ethics",
    topic: "Accountability for Client Funds",
    difficulty: "hard",
    tags: ["client-funds", "fiduciary-duty", "discipline"],
    prompt:
      "A lawyer received settlement proceeds for a client and deposited the amount into his personal account. He released only part of the funds and repeatedly delayed remittance of the balance, citing office expenses. The client filed an administrative complaint. Discuss the lawyer's fiduciary duties over client funds and likely sanctions.",
    sourceTitle: "CPRA provisions on fiduciary accountability",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Legal Ethics",
    topic: "Candor and Duty to the Court",
    difficulty: "medium",
    tags: ["candor", "court-duty", "professional-ethics"],
    prompt:
      "Counsel knowingly cited an overruled Supreme Court ruling as controlling authority without disclosing later contrary jurisprudence, and used this citation to obtain interim relief. Opposing counsel discovered the omission and sought sanctions. Discuss the lawyer's duty of candor to the court and corresponding disciplinary exposure.",
    sourceTitle: "CPRA canons on integrity and candor",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Political Law",
    topic: "Eminent Domain - Public Use",
    difficulty: "medium",
    tags: ["eminent-domain", "public-use", "just-compensation"],
    prompt:
      "A province expropriated private farmland to develop a tourism-commercial complex operated through a joint venture with a private corporation. The owner challenges the taking, alleging lack of genuine public use and inadequate compensation. Discuss constitutional requirements for eminent domain, the concept of public use, and how just compensation is determined.",
    sourceTitle: "1987 Constitution, Article III and jurisprudence on eminent domain",
    sourceUrl: "https://lawphil.net/consti/cons1987.html",
  },
  {
    subject: "Political Law",
    topic: "Freedom of Expression - Prior Restraint",
    difficulty: "hard",
    tags: ["free-speech", "prior-restraint", "media-law"],
    prompt:
      "A regulatory agency ordered a news outlet to take down investigative videos pending administrative review of alleged misinformation. The outlet claims unconstitutional prior restraint. The agency argues this is a valid content regulation to protect public order. Resolve the issue and discuss standards applicable to prior restraint under Philippine law.",
    sourceTitle: "1987 Constitution, Article III, Section 4",
    sourceUrl: "https://lawphil.net/consti/cons1987.html",
  },
  {
    subject: "Political Law",
    topic: "Citizenship - Dual Citizenship",
    difficulty: "easy",
    tags: ["citizenship", "dual-citizenship", "public-office"],
    prompt:
      "A natural-born Filipino who became a foreign citizen later reacquired Philippine citizenship under statutory law and ran for local elective office. Opponents argue she remained disqualified due to dual allegiance. Discuss constitutional and statutory rules on reacquisition of citizenship and qualifications for elective office.",
    sourceTitle: "Constitution and Citizenship Retention and Re-acquisition Act",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2003/ra_9225_2003.html",
  },
  {
    subject: "Political Law",
    topic: "Public Officers - Preventive Suspension",
    difficulty: "medium",
    tags: ["public-officers", "preventive-suspension", "administrative-law"],
    prompt:
      "An elective city official facing an administrative complaint was preventively suspended for 180 days by a disciplinary body. He argues the period is excessive and violates due process. Discuss the legal basis, purpose, and limits of preventive suspension of public officers.",
    sourceTitle: "Local Government Code and administrative law jurisprudence",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html",
  },
  {
    subject: "Civil Law",
    topic: "Persons and Family Relations - Psychological Incapacity",
    difficulty: "hard",
    tags: ["family-code", "psychological-incapacity", "nullity"],
    prompt:
      "After ten years of marriage, Rosa filed a petition to declare her marriage void on grounds of psychological incapacity, alleging her spouse showed persistent emotional immaturity, compulsive infidelity, and inability to fulfill marital obligations from the start. Her spouse denies incapacity and calls the case a mere incompatibility issue. Discuss the requisites for psychological incapacity and evidentiary considerations.",
    sourceTitle: "Family Code Article 36 and related jurisprudence",
    sourceUrl: "https://lawphil.net/executive/execord/eo1987/eo_209_1987.html",
  },
  {
    subject: "Civil Law",
    topic: "Lease - Ejectment and Rent Arrears",
    difficulty: "easy",
    tags: ["lease", "ejectment", "unlawful-detainer"],
    prompt:
      "A tenant stopped paying rent for four months and ignored a written demand to pay and vacate within 15 days. The landlord filed an unlawful detainer case after 45 days. The tenant claims the case should be dismissed because no lease contract was notarized. Resolve the issue and discuss requisites of unlawful detainer actions.",
    sourceTitle: "Civil Code on lease; Rules on summary procedure",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Civil Law",
    topic: "Torts and Damages - Negligence",
    difficulty: "medium",
    tags: ["quasi-delict", "damages", "negligence"],
    prompt:
      "A bus company driver oversped on a rainy highway and collided with a private car, injuring passengers in both vehicles. The company argues the car owner was also negligent for sudden lane change. As counsel for injured passengers, discuss the basis of liability, possible defenses, and recoverable damages under quasi-delict principles.",
    sourceTitle: "Civil Code provisions on quasi-delicts and damages",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Civil Law",
    topic: "Partnership - Liability to Third Persons",
    difficulty: "medium",
    tags: ["partnership", "solidary-liability", "commercial-transactions"],
    prompt:
      "A partnership defaulted on supplier obligations after one partner executed supply contracts in the firm name. Other partners claim they did not authorize those transactions and should not be liable. Discuss the liability of the partnership and partners to third persons and when a partner's acts bind the firm.",
    sourceTitle: "Civil Code provisions on partnership",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Criminal Law",
    topic: "Conspiracy and Degree of Participation",
    difficulty: "hard",
    tags: ["conspiracy", "principals", "accomplice"],
    prompt:
      "Three individuals planned to rob a convenience store. One acted as lookout, one entered and took cash, and one drove the getaway vehicle. During escape, the gunman shot a guard. The lookout claims he should be liable only for theft since he never intended violence. Discuss conspiracy, liability for acts of co-conspirators, and degree of participation.",
    sourceTitle: "Revised Penal Code on conspiracy and participation",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Criminal Law",
    topic: "Criminal Liability - Impossible Crime",
    difficulty: "easy",
    tags: ["impossible-crime", "rpc", "intent"],
    prompt:
      "Believing it to be poison, Carlo mixed sugar into his rival's drink intending to kill him. The rival consumed it and suffered no harm. Carlo was charged criminally. Discuss whether Carlo may be liable for an impossible crime and the policy rationale behind punishing this class of acts.",
    sourceTitle: "Revised Penal Code, Article 4",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Criminal Law",
    topic: "Extinction of Criminal Liability - Prescription",
    difficulty: "medium",
    tags: ["prescription", "criminal-liability", "interruptions"],
    prompt:
      "A complaint for a less grave felony was filed six years after the alleged commission. The prosecution argues prescription was interrupted by an earlier complaint filed with the prosecutor's office but dismissed for insufficiency of evidence. Resolve whether criminal liability prescribed and discuss rules on interruption of prescriptive periods.",
    sourceTitle: "Revised Penal Code on prescription of crimes",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Criminal Law",
    topic: "Crimes Against Persons - Treachery",
    difficulty: "medium",
    tags: ["treachery", "qualifying-circumstances", "homicide-murder"],
    prompt:
      "During a quarrel, Edgar suddenly shot Ben from behind while Ben was walking away. Edgar claims there was no plan and the shooting happened in the heat of anger. The prosecution alleges murder qualified by treachery. Discuss requisites of treachery and whether the killing should be classified as homicide or murder.",
    sourceTitle: "Revised Penal Code provisions on homicide and murder",
    sourceUrl: "https://lawphil.net/statutes/acts/act_3815_1930.html",
  },
  {
    subject: "Labor Law",
    topic: "Hours of Work - Overtime Pay",
    difficulty: "easy",
    tags: ["overtime", "labor-standards", "wage-rules"],
    prompt:
      "A company required supervisors to work 12-hour shifts but paid only basic monthly salaries, arguing supervisors are managerial employees exempt from overtime. Employees contest their classification and claim overtime premium. Discuss tests for managerial or supervisory status and entitlement to overtime pay.",
    sourceTitle: "Labor Code and implementing rules on hours of work",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Labor Law",
    topic: "Occupational Safety and Health",
    difficulty: "medium",
    tags: ["osh", "workplace-safety", "labor-compliance"],
    prompt:
      "Factory workers reported repeated chemical exposure incidents and requested protective equipment. Management delayed procurement and one worker was hospitalized. The union files complaints for OSH violations and money claims. Discuss employer duties under workplace safety laws and possible liabilities.",
    sourceTitle: "Occupational Safety and Health Standards Law",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2018/ra_11058_2018.html",
  },
  {
    subject: "Labor Law",
    topic: "Leave Benefits - Service Incentive Leave",
    difficulty: "easy",
    tags: ["service-incentive-leave", "benefits", "labor-standards"],
    prompt:
      "A sales employee with six years of service resigned and demanded conversion to cash of unused service incentive leave credits. Employer denied the claim, asserting the employee was paid on commission basis and thus exempt. Discuss entitlement to service incentive leave and conversion rules upon separation.",
    sourceTitle: "Labor Code provisions on leave benefits",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Labor Law",
    topic: "Money Claims - Prescription",
    difficulty: "medium",
    tags: ["money-claims", "prescription", "labor-procedure"],
    prompt:
      "Former employees sued for unpaid holiday pay and salary differentials covering eight years of service. Employer moved to dismiss claims older than three years. Employees argue employer's repeated promises to settle interrupted prescription. Discuss the prescriptive period for money claims and when interruption applies.",
    sourceTitle: "Labor Code prescription provisions",
    sourceUrl: "https://lawphil.net/statutes/presdecs/pd1974/pd_442_1974.html",
  },
  {
    subject: "Taxation Law",
    topic: "Estate Tax",
    difficulty: "medium",
    tags: ["estate-tax", "gross-estate", "deductions"],
    prompt:
      "Upon Marco's death, his estate included Philippine real properties, foreign bank deposits, and insurance proceeds payable to his estate. Executors excluded some items and claimed maximum deductions. BIR issued deficiency estate tax assessment. Discuss what properties form part of gross estate and allowable deductions under current law.",
    sourceTitle: "National Internal Revenue Code, estate tax provisions",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Withholding Tax Compliance",
    difficulty: "easy",
    tags: ["withholding-tax", "compliance", "penalties"],
    prompt:
      "A corporation deducted expanded withholding tax from supplier payments but failed to remit the amounts on time due to cash flow issues. It later settled principal tax but contests surcharges and interest. Discuss withholding tax obligations and consequences of late remittance under Philippine tax law.",
    sourceTitle: "NIRC and withholding tax regulations",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Excise Tax",
    difficulty: "medium",
    tags: ["excise-tax", "manufacturing", "tax-base"],
    prompt:
      "A beverage manufacturer reclassified some products as non-sweetened to avoid higher excise taxes, citing reformulated ingredients. The BIR assessed deficiency excise tax after audit. Discuss principles governing excise tax classification and burden of proof in tax assessments.",
    sourceTitle: "NIRC excise tax provisions",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Taxation Law",
    topic: "Tax Exemptions - Strictissimi Juris",
    difficulty: "hard",
    tags: ["tax-exemption", "strictissimi-juris", "interpretation"],
    prompt:
      "A nonprofit foundation claimed full exemption from donor's and income taxes based on its charter and social welfare activities. The BIR granted partial exemption only for income actually and directly used for charitable purposes. Discuss interpretation of tax exemptions and evidentiary requirements to claim preferential treatment.",
    sourceTitle: "Constitution and NIRC on tax exemptions",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8424_1997.html",
  },
  {
    subject: "Remedial Law",
    topic: "Pleadings - Amendment",
    difficulty: "easy",
    tags: ["pleadings", "amendment", "civil-procedure"],
    prompt:
      "Plaintiff filed a complaint for collection but later discovered documentary evidence supporting an additional cause of action for damages. Defendant had already filed an answer. Plaintiff filed an amended complaint without leave of court. Discuss when pleadings may be amended as a matter of right or by leave, and effects of unauthorized amendment.",
    sourceTitle: "Rules of Court on pleadings",
    sourceUrl: "https://lawphil.net/courts/rules/rc_1-71_civil.html",
  },
  {
    subject: "Remedial Law",
    topic: "Appeals - Period and Perfection",
    difficulty: "medium",
    tags: ["appeal", "perfection", "procedural-law"],
    prompt:
      "The RTC rendered judgment on 1 March. Defendant received copy on 5 March and filed a notice of appeal on 22 March, arguing a motion for extension filed earlier tolled the period. Plaintiff moves to dismiss appeal as late. Discuss the reglementary period for appeal and when an appeal is perfected.",
    sourceTitle: "Rules of Court on appeals",
    sourceUrl: "https://lawphil.net/courts/rules/rc_1-71_civil.html",
  },
  {
    subject: "Remedial Law",
    topic: "Evidence - Judicial Admissions",
    difficulty: "easy",
    tags: ["judicial-admission", "evidence", "trial"],
    prompt:
      "In his verified answer, defendant admitted signing a promissory note but later testified at trial that the signature was forged. Plaintiff objects and invokes judicial admission. Discuss the binding effect of judicial admissions and circumstances when they may be withdrawn or contradicted.",
    sourceTitle: "Rules on Evidence and procedural rules",
    sourceUrl: "https://lawphil.net/courts/rules/rc_128-133_evidence.html",
  },
  {
    subject: "Remedial Law",
    topic: "Special Proceedings - Settlement of Estate",
    difficulty: "hard",
    tags: ["special-proceedings", "estate", "probate"],
    prompt:
      "Two heirs filed competing petitions: one for probate of an alleged holographic will, and another for intestate settlement, both involving the same decedent and properties in different provinces. Discuss proper venue, priority of proceedings, and remedies to avoid conflicting rulings.",
    sourceTitle: "Rules of Court on special proceedings",
    sourceUrl: "https://lawphil.net/courts/rules/rc_72-109_special.html",
  },
  {
    subject: "Commercial Law",
    topic: "Sales Law - Letter of Credit",
    difficulty: "hard",
    tags: ["letter-of-credit", "banking", "commercial-transactions"],
    prompt:
      "A buyer opened an irrevocable letter of credit in favor of a foreign seller. The issuing bank refused to honor a conforming draft, alleging underlying goods were defective based on buyer's complaint. Seller sues the bank. Discuss the independence principle and exceptions under letter of credit law.",
    sourceTitle: "Commercial law principles and UCP practice",
    sourceUrl: "https://lawphil.net",
  },
  {
    subject: "Commercial Law",
    topic: "Transportation Law - Common Carrier Liability",
    difficulty: "medium",
    tags: ["common-carrier", "extraordinary-diligence", "damages"],
    prompt:
      "A bus terminal admitted passengers but allowed standing riders in excess of seating capacity. During travel, a collision caused injuries to standing passengers. The carrier argues the other vehicle was at fault. Discuss the standard of diligence required of common carriers and presumptions governing carrier liability.",
    sourceTitle: "Civil Code and transportation law principles",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1949/ra_386_1949.html",
  },
  {
    subject: "Commercial Law",
    topic: "Intellectual Property - Trademark Infringement",
    difficulty: "medium",
    tags: ["trademark", "ip-code", "infringement"],
    prompt:
      "A local startup used a mark visually similar to a famous registered brand for related goods, claiming no bad faith because color and packaging differ. The registered owner sues for infringement and damages. Discuss the tests for likelihood of confusion and available remedies under Philippine IP law.",
    sourceTitle: "Intellectual Property Code of the Philippines",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra1997/ra_8293_1997.html",
  },
  {
    subject: "Commercial Law",
    topic: "Competition Law - Abuse of Dominance",
    difficulty: "easy",
    tags: ["competition-law", "dominance", "market-conduct"],
    prompt:
      "A dominant digital platform imposed exclusive dealing terms on merchants and penalized those listing products on competitor platforms. A complaint alleges abuse of dominant position. Discuss key elements of abuse of dominance and factors considered in assessing anti-competitive conduct.",
    sourceTitle: "Philippine Competition Act",
    sourceUrl: "https://lawphil.net/statutes/repacts/ra2015/ra_10667_2015.html",
  },
  {
    subject: "Legal Ethics",
    topic: "Withdrawal of Counsel",
    difficulty: "easy",
    tags: ["withdrawal", "professional-duty", "client-protection"],
    prompt:
      "A lawyer stopped appearing in hearings after disagreement with client over fees, without filing a formal motion to withdraw or notifying the client of hearing dates. Judgment was later rendered against the client. Discuss ethical and procedural duties in counsel withdrawal and potential liability.",
    sourceTitle: "CPRA and Rules of Court",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Legal Ethics",
    topic: "Competence and Diligence",
    difficulty: "medium",
    tags: ["competence", "diligence", "professional-responsibility"],
    prompt:
      "Counsel failed to file a pre-trial brief and repeatedly missed filing deadlines, resulting in dismissal of the client's complaint. The lawyer explains heavy workload and staffing shortages. Discuss standards of competence and diligence expected of lawyers and potential disciplinary consequences.",
    sourceTitle: "Code of Professional Responsibility and Accountability",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Legal Ethics",
    topic: "Privilege Against Conflicts in Government Service",
    difficulty: "hard",
    tags: ["government-lawyer", "conflict-of-interest", "post-employment"],
    prompt:
      "A former government lawyer who handled procurement disputes accepted private engagement to challenge the same agency's procurement award using information obtained during public service. A complaint alleges conflict and misuse of confidential information. Discuss ethical restrictions applicable to former government lawyers.",
    sourceTitle: "CPRA and relevant public accountability laws",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
  {
    subject: "Legal Ethics",
    topic: "Lawyer-Client Relationship and Fee Agreements",
    difficulty: "medium",
    tags: ["attorney-fees", "engagement", "professional-conduct"],
    prompt:
      "A lawyer verbally agreed to represent a client in a property dispute and later demanded 40% of the property as contingent fee, despite no written fee agreement. Client disputes reasonableness and enforceability. Discuss rules on attorney's fees, contingent fees, and factors in determining reasonable compensation.",
    sourceTitle: "CPRA and Civil Code principles on fees",
    sourceUrl: "https://sc.judiciary.gov.ph/code-of-professional-responsibility-and-accountability/",
  },
];

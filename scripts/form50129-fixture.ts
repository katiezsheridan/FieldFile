/**
 * Realistic hardcoded payload for de-risking the Form 50-129 fill service
 * (Session 1). Bark Springs LLC — a Corporation owner filing through an
 * officer, wildlife-management use, Hays CAD. Shared by the demo script and
 * the read-back test so both exercise the same data.
 *
 * NOT production data — a throwaway fixture.
 */

import type { Form50129Payload } from "../lib/forms/form50129/fieldMap";

export const barkSpringsPayload: Form50129Payload = {
  taxYear: 2025,
  appraisalDistrictCounty: "Hays",
  accountNumber: "R123456",

  owner: {
    type: "corporation",
    name: "Bark Springs LLC",
    physicalAddress: "1200 Ranch Road 12, Wimberley, TX 78676",
    mailingAddress: "PO Box 481, Wimberley, TX 78676",
    phone: "(512) 555-0142",
    email: "owner@barksprings.example",
    // A corporation has no date of birth; left blank.
  },

  representative: {
    basis: "officer",
    name: "Dana Whitfield",
    title: "Managing Member",
    phone: "(512) 555-0142",
    email: "dana@barksprings.example",
    mailingAddress: "PO Box 481, Wimberley, TX 78676",
  },

  property: {
    numberOfAcres: 78.4,
    legalDescription:
      "ABS 123 SUR 45 J. SMITH, 78.4 ACRES, HAYS COUNTY, TX; Plat No. 2019-0456",
    accountNumber: "R123456",
    // Renewal branch: 1-d-1 was allowed on this property last year, and nothing
    // has changed. (No ownership change → the new-owner question Q4 is N/A and
    // left blank.)
    allowedLastYear: true,
    ownershipChangedSinceLastYear: false,
    deceasedSurvivingSpouse: false,
    withinCityLimits: false,
  },

  section4: {
    history: [
      { category: "Wildlife management", acres: 78.4 },
      { category: "Wildlife management", acres: 78.4 },
      { category: "Native pastureland", acres: 78.4 },
    ],
  },

  wildlife: {
    practices: [
      "Habitat control — selective brush management and native grass restoration",
      "Supplemental water — three wildlife guzzlers maintained year-round",
      "Census — annual spotlight deer counts and quarterly bird surveys",
    ],
    priorUseCategory: "Native pastureland",
    hasWmp: true,
    partOfLargerTract: false,
    managedByAssociation: false,
    endangeredHabitat: false,
    esaPermit: false,
  },

  timber: {
    convertedAfter1997: false,
  },

  certification: {
    printedName: "Dana Whitfield",
  },
};

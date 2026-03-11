"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ArticleSection {
  heading?: string;
  paragraphs: string[];
}

interface Article {
  slug: string;
  title: string;
  readingTime: string;
  description: string;
  content: ArticleSection[];
}

const articles: Article[] = [
  {
    slug: "common-mistakes",
    title: "5 Common Mistakes Landowners Make During Filing Season",
    readingTime: "8 min read",
    description:
      "Avoid these pitfalls to ensure your annual report is accepted the first time.",
    content: [
      {
        paragraphs: [
          "Filing season for wildlife management tax exemptions can be stressful, especially if you're doing it for the first time. Every year, Texas landowners risk losing their wildlife valuation — and the significant property tax savings that come with it — because of avoidable mistakes in their annual reports.",
          "Whether you manage 15 acres in the Hill Country or 500 acres in South Texas, the filing process requires careful documentation, timely submission, and attention to your county's specific rules. Here are the five most common mistakes we see landowners make, and how to avoid them.",
        ],
      },
      {
        heading: "Mistake #1: Waiting Until the Last Minute",
        paragraphs: [
          "This is by far the most common problem. Filing deadlines vary by county — some require submissions by April 30, others have different windows — and many landowners don't start gathering their documentation until a few weeks before the deadline.",
          "The problem with waiting is that wildlife management documentation needs to be collected throughout the year. If you haven't been photographing your activities, logging dates, and saving receipts as you go, you'll find yourself scrambling to reconstruct a year's worth of work from memory. The result is often incomplete or inaccurate reports that raise red flags with county appraisers.",
          "The fix is simple: start documenting from day one. Set up a system — whether it's a binder, a shared folder, or a tool like FieldFile — and log each activity as it happens. By the time filing season arrives, your report practically writes itself.",
        ],
      },
      {
        heading: "Mistake #2: Insufficient Photo Documentation",
        paragraphs: [
          "County appraisers want to see visual evidence that you're actively managing your land for wildlife. A report full of text descriptions but no photos is a report that's likely to get questioned — or rejected.",
          "The best documentation includes timestamped, GPS-tagged photographs that clearly show your management activities. This means photos of your feeders being filled, your water stations in operation, trail camera setups, habitat improvements in progress, and wildlife observed on your property.",
          "Many landowners take photos but forget to include critical details: the date, the location on the property, and a brief description of what the photo shows. Without this context, even good photos lose their evidentiary value. Aim for at least 3-5 photos per activity, taken at different stages (setup, in-progress, and results).",
        ],
      },
      {
        heading: "Mistake #3: Not Meeting the Three-Activity Minimum",
        paragraphs: [
          "Texas requires landowners to perform at least three of seven qualifying wildlife management activities to maintain their exemption. These categories are: habitat control, erosion control, predator management, providing supplemental water, providing supplemental food, providing shelters, and conducting wildlife census counts.",
          "Some landowners focus heavily on one or two activities — say, running feeders and maintaining water stations — without realizing they need a third qualifying activity. Others assume that general ranch maintenance counts as wildlife management when it doesn't meet the specific criteria.",
          "Before the year begins, plan which three (or more) activities you'll focus on and make sure you understand what each one requires. For example, simply having a bird feeder in your yard doesn't count as supplemental feeding — you need a documented, purposeful feeding program with records of what you're providing, how much, and how often.",
        ],
      },
      {
        heading: "Mistake #4: Ignoring County-Specific Requirements",
        paragraphs: [
          "Texas has 254 counties, and each county's appraisal district has its own forms, expectations, and quirks. What works perfectly for a filing in Travis County might be missing key elements that Gillespie County requires.",
          "Some counties use the standard Texas Parks and Wildlife Department (TPWD) forms, while others have their own supplemental forms. Some want detailed narrative descriptions of each activity, while others prefer structured checklists. Some accept digital submissions; others require physical copies delivered in person or by mail.",
          "The biggest mistake here is assuming that one size fits all. Before you start preparing your report, contact your county appraisal district or check their website to understand exactly what they expect. Better yet, use a service that stays current on all 254 counties' requirements so you don't have to track this yourself.",
        ],
      },
      {
        heading: "Mistake #5: Poor Record Organization",
        paragraphs: [
          "Even landowners who do everything right throughout the year can stumble at filing time if their records are disorganized. Photos scattered across three phones, receipts crammed in a glove compartment, and handwritten notes on the back of envelopes do not make for a compelling annual report.",
          "Appraisers review hundreds of reports each season. A well-organized submission with clearly labeled sections, chronological documentation, and easy-to-find supporting evidence stands out — and is far more likely to be approved without follow-up questions.",
          "Create a simple organizational system at the start of each year. Keep a dedicated folder (physical or digital) for each management activity. File photos, receipts, and notes into the appropriate folder as you go. When it's time to compile your report, you'll have everything sorted and ready.",
        ],
      },
      {
        heading: "How to Avoid These Mistakes",
        paragraphs: [
          "The common thread in all five mistakes is the same: lack of a system. Wildlife management tax exemptions reward consistent, documented effort throughout the year — not last-minute scrambling.",
          "Start early, document as you go, know your county's requirements, and keep your records organized. If that sounds like a lot to manage on top of actually running your property, that's exactly why FieldFile exists. We help landowners track activities, store documentation, and generate county-ready reports so you can focus on managing your land instead of managing paperwork.",
        ],
      },
    ],
  },
  {
    slug: "county-requirements",
    title: "Unique County-Specific Requirements in Texas",
    readingTime: "10 min read",
    description:
      "Why filing requirements differ across all 254 Texas counties and what you need to know.",
    content: [
      {
        paragraphs: [
          "One of the most confusing aspects of maintaining a wildlife management tax exemption in Texas is that the rules aren't the same everywhere. With 254 counties — each governed by its own independent appraisal district — the specific requirements for filing your annual wildlife management report can vary significantly from one county to the next.",
          "Understanding these differences is critical. A report that would sail through review in one county might be sent back for revisions in another. Here's what you need to know about county-specific requirements and how to navigate them.",
        ],
      },
      {
        heading: "Why County Requirements Differ",
        paragraphs: [
          "Texas property tax administration is decentralized by design. While the state sets the broad framework through the Texas Tax Code and the Texas Parks and Wildlife Department provides general guidelines, each county's Central Appraisal District (CAD) has significant latitude in how they implement and enforce wildlife management valuations.",
          "This means each CAD can set their own forms, documentation standards, filing procedures, and review processes. Some districts have dedicated wildlife management staff who review reports in detail, while others rely on general appraisers who may have less familiarity with wildlife practices.",
        ],
      },
      {
        heading: "Filing Deadlines Vary More Than You Think",
        paragraphs: [
          "While April 30 is the most common deadline for property tax exemption applications in Texas, the specifics around wildlife management reports can differ. Some counties want your annual management plan and activity report submitted alongside your regular exemption application. Others have separate submission windows or require mid-year progress reports.",
          "Late filings are handled differently too. Some counties offer a grace period with a late fee, while others may require you to reapply entirely. Missing a deadline by even one day can put your entire exemption at risk for the year, so knowing your county's exact timeline is essential.",
        ],
      },
      {
        heading: "Form Differences Across Counties",
        paragraphs: [
          "The Texas Parks and Wildlife Department provides a standard Wildlife Management Plan template (PWD 885-W7000) that many counties accept. However, a growing number of counties have developed their own supplemental forms or require additional documentation beyond the TPWD standard.",
          "For example, some counties require a separate property map showing the locations of all management activities. Others want a detailed budget showing money spent on wildlife management during the year. A few counties have adopted online submission portals with their own specific formatting requirements.",
          "If you're filing for the first time, don't assume the TPWD form is all you need. Always check with your specific county appraisal district to get their complete list of required forms and supporting documents.",
        ],
      },
      {
        heading: "Documentation Standards",
        paragraphs: [
          "What counts as sufficient evidence varies widely. Some counties are satisfied with a narrative description of your activities accompanied by a handful of photos. Others expect detailed photo logs with dates, GPS coordinates, and descriptions for every image.",
          "Receipt requirements also differ. Certain counties want to see invoices for any equipment or supplies purchased for wildlife management. Others don't require financial documentation at all but want more detailed field notes about the time spent on each activity.",
          "The level of detail expected in census data is another area of variation. Some counties accept simple species lists and estimated counts, while others want structured data from trail cameras, formal transect surveys, or point count methodologies.",
        ],
      },
      {
        heading: "Acreage and Eligibility Requirements",
        paragraphs: [
          "While the Texas Tax Code sets a minimum acreage threshold for agricultural valuations, individual counties may interpret the rules differently when it comes to wildlife management conversions. The general rule is that your property must have qualified for agricultural valuation (ag exemption) before converting to wildlife management.",
          "Some counties are more flexible about the types of properties that can qualify, while others apply stricter interpretations. Properties in suburban fringe areas — where development pressure is high — may face additional scrutiny regardless of their size or management practices.",
        ],
      },
      {
        heading: "Examples from Specific Counties",
        paragraphs: [
          "Gillespie County, in the heart of the Hill Country, is known for thorough reviews of wildlife management reports. Their appraisal district expects detailed photo documentation, property maps with activity locations marked, and evidence of at least three distinct management activities spread throughout the year.",
          "Hays County, which spans from the Hill Country into the Blackland Prairie, has seen rapid growth and development. Their appraisal district pays particular attention to properties near urban areas and may require additional documentation to verify that wildlife management is genuinely being conducted rather than being used as a tax strategy on otherwise inactive land.",
          "Blanco County tends to be more straightforward in their requirements, generally accepting the standard TPWD forms with supporting photos. However, they do expect consistent year-over-year documentation and may question significant changes in management activities from one year to the next.",
          "Travis County, home to Austin, has a large appraisal district with dedicated staff for wildlife management reviews. They accept digital submissions and have specific formatting preferences for photos and supporting documents. Their review process is typically thorough but efficient.",
        ],
      },
      {
        heading: "How FieldFile Handles County Differences",
        paragraphs: [
          "Keeping track of 254 different sets of requirements is a full-time job — which is why we do it for you. FieldFile maintains an up-to-date database of every Texas county's specific wildlife management filing requirements, including their forms, deadlines, documentation standards, and submission procedures.",
          "When you set up your property in FieldFile, we automatically customize your experience based on your county. Your reminders match your county's deadlines, your reports are formatted to match your county's preferences, and we review everything before submission to make sure nothing is missing.",
          "Whether you're in a county with simple requirements or one that demands extensive documentation, FieldFile ensures your filing meets the standard — the first time.",
        ],
      },
    ],
  },
  {
    slug: "wildlife-management-plan",
    title: "How to Create a Wildlife Management Plan: A Step-by-Step Guide",
    readingTime: "10 min read",
    description:
      "Everything you need to build a compliant wildlife management plan from scratch.",
    content: [
      {
        paragraphs: [
          "A wildlife management plan is the foundation of your wildlife tax exemption in Texas. It's a formal document that describes your property, identifies the wildlife species you'll manage for, and outlines the specific activities you'll conduct throughout the year.",
          "Without a solid management plan, your annual report has no framework — and your county appraisal district has no basis for approving your wildlife valuation. Here's how to create one from scratch, step by step.",
        ],
      },
      {
        heading: "What Is a Wildlife Management Plan?",
        paragraphs: [
          "A wildlife management plan is a written document that serves as your roadmap for managing your property's wildlife resources. Think of it as a business plan for your land — it describes where you are now, where you want to go, and how you'll get there.",
          "The plan is typically submitted to your county appraisal district when you first convert from agricultural valuation to wildlife management valuation. Once approved, it remains in effect for multiple years, though most counties expect you to update it if your goals or activities change significantly.",
          "The Texas Parks and Wildlife Department provides a standard template (PWD 885-W7000), but your county may have additional requirements. Always check with your local appraisal district before starting.",
        ],
      },
      {
        heading: "Step 1: Property Description and Assessment",
        paragraphs: [
          "Start with a thorough description of your property. Include the total acreage, legal description, and physical location. Describe the topography — is it flat, hilly, wooded, open grassland? Note any water features like creeks, ponds, or tanks.",
          "Document the existing vegetation types and their approximate coverage. For example: 40% mixed oak-juniper woodland, 30% native grassland, 20% improved pasture, and 10% riparian corridor along a creek. This vegetation inventory helps establish what habitat types are available for wildlife.",
          "Include information about the property's history — what was it used for before? If it was previously grazed, how intensively? Are there existing structures, fences, or improvements? What's the current condition of the habitat? This baseline assessment is critical for showing that your management activities are making a meaningful difference.",
        ],
      },
      {
        heading: "Step 2: Identify Target Species",
        paragraphs: [
          "Your plan needs to identify which wildlife species are present on or near your property and which ones you'll actively manage for. You don't need to manage for every species — focus on the ones that are native to your area and that benefit from the habitat your property provides.",
          "Common target species in Texas include white-tailed deer, Rio Grande turkey, bobwhite quail, mourning dove, various songbird species, and native pollinators. In some regions, you might also manage for species like pronghorn antelope, mule deer, or various reptile and amphibian species.",
          "If your property is in an area with threatened or endangered species — such as the golden-cheeked warbler in the Hill Country or the Houston toad in Bastrop County — noting their presence and incorporating protective measures into your plan strengthens your application significantly.",
        ],
      },
      {
        heading: "Step 3: Select Your Management Activities",
        paragraphs: [
          "This is the core of your plan. Texas recognizes seven categories of qualifying wildlife management activities. You must conduct at least three of them each year to maintain your exemption:",
          "1. Habitat Control — Managing vegetation through prescribed burns, brush management, mowing, or reseeding to improve wildlife habitat. This might include cedar clearing in the Hill Country or planting native grasses to restore degraded pastures.",
          "2. Erosion Control — Implementing measures to prevent soil loss and protect water quality. Examples include building terraces, installing check dams, maintaining buffer strips along waterways, and stabilizing eroding banks.",
          "3. Predator Management — Controlling populations of predators that negatively impact your target wildlife species. This could involve trapping feral hogs, managing raccoon populations near ground-nesting bird habitat, or controlling invasive fire ant colonies.",
          "4. Providing Supplemental Water — Installing and maintaining water sources for wildlife, especially during dry periods. This includes wildlife drinkers, modified stock tanks with escape ramps, drip systems, and maintained springs or seeps.",
          "5. Providing Supplemental Food — Establishing food plots, maintaining feeders, or planting wildlife-friendly vegetation that provides nutrition during stress periods. Food plots might include clover, winter wheat, or native seed mixes depending on your target species.",
          "6. Providing Shelters — Creating or maintaining structures that provide cover, nesting sites, or roosting areas for wildlife. Examples include brush piles, nest boxes, bat houses, and maintaining standing dead trees (snags) for cavity-nesting species.",
          "7. Census Counts — Conducting regular surveys to monitor wildlife populations on your property. Methods include trail camera surveys, spotlight counts, point counts for birds, and track stations. This data demonstrates that your management is having a positive effect.",
        ],
      },
      {
        heading: "Step 4: Create an Activity Schedule",
        paragraphs: [
          "For each activity you've selected, outline when and how often it will be performed throughout the year. Wildlife management isn't something you do once a year and forget about — it requires consistent effort across all seasons.",
          "For example, your schedule might include: census counts in spring and fall, feeder maintenance weekly from October through March, water station checks twice monthly year-round, brush management during winter months, and nest box installation and monitoring in early spring.",
          "Your schedule should be realistic given the time and resources you have available. It's better to commit to three activities done well than to list seven activities you can't actually maintain. County appraisers look for evidence that you're following through on your stated plan.",
        ],
      },
      {
        heading: "Step 5: Establish Documentation Procedures",
        paragraphs: [
          "Your plan should describe how you'll document each activity. This is where many landowners fall short — they do the work but don't capture the evidence needed to prove it.",
          "For each activity, plan to record: the date and time, who performed the activity, exactly what was done, photographs (preferably GPS-tagged and timestamped), any materials or supplies used (keep receipts), and the results observed.",
          "Create a consistent system from day one. Decide where you'll store photos, how you'll organize receipts, and how you'll log field notes. A dedicated phone folder, a shared cloud drive, or a purpose-built tool like FieldFile can keep everything organized and accessible when it's time to compile your annual report.",
        ],
      },
      {
        heading: "Step 6: Submit to Your County Appraisal District",
        paragraphs: [
          "Once your plan is complete, submit it to your county appraisal district along with your application for wildlife management valuation. If you're converting from an existing agricultural valuation, you'll typically need to submit the plan with your annual property tax rendition.",
          "Some counties review plans in-house, while others send them to a Texas Parks and Wildlife biologist for review. The review process can take several weeks, so submit well before any deadlines.",
          "If your plan is returned with questions or requests for revision, don't panic — this is common, especially for first-time filers. Address the feedback, make the requested changes, and resubmit. Most counties are willing to work with landowners who demonstrate a genuine commitment to wildlife management.",
        ],
      },
      {
        heading: "Common Questions About Management Plans",
        paragraphs: [
          "How long does a plan last? Most counties consider a wildlife management plan valid for 5-10 years, though you should update it if your goals, target species, or management activities change significantly. Your annual report shows what you actually did each year within the framework of the plan.",
          "Do I need a biologist to write my plan? Not necessarily, but having a certified wildlife biologist review your plan can strengthen it. Some counties may recommend or require a biologist's involvement, particularly for properties with sensitive species or complex habitat management needs.",
          "Can I change activities year to year? Yes, as long as you continue to meet the minimum of three qualifying activities. Your plan outlines your general approach, but your annual report documents what you actually did. Flexibility is built into the system — just make sure to document everything.",
          "Getting your management plan right from the start saves you years of headaches. If you need help building or updating your plan, FieldFile can guide you through the process and make sure it meets your county's specific requirements.",
        ],
      },
    ],
  },
];

function ResourcesContent() {
  const searchParams = useSearchParams();
  const paramSlug = searchParams.get("article");
  const [selectedSlug, setSelectedSlug] = useState(
    paramSlug && articles.some((a) => a.slug === paramSlug)
      ? paramSlug
      : articles[0].slug
  );

  useEffect(() => {
    const param = searchParams.get("article");
    if (param && articles.some((a) => a.slug === param)) {
      setSelectedSlug(param);
    }
  }, [searchParams]);

  const selectedArticle =
    articles.find((a) => a.slug === selectedSlug) || articles[0];

  return (
    <div className="bg-field-cream">
      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-field-black mb-4 tracking-tight">
            Wildlife Management Resources
          </h1>
          <p className="text-lg text-field-black/70 max-w-2xl mx-auto">
            Guides and articles to help Texas landowners navigate wildlife tax
            exemptions, filing requirements, and property management.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Mobile dropdown */}
          <div className="lg:hidden">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border border-field-brown/10 text-field-ink text-sm focus:outline-none focus:border-field-green"
            >
              {articles.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-8">
              <nav className="space-y-2">
                {articles.map((a) => (
                  <button
                    key={a.slug}
                    onClick={() => setSelectedSlug(a.slug)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      selectedSlug === a.slug
                        ? "bg-white border-field-green shadow-sm"
                        : "bg-white/50 border-field-brown/10 hover:bg-white hover:border-field-green/40"
                    )}
                  >
                    <h3 className="font-medium text-field-ink text-sm">
                      {a.title}
                    </h3>
                    <p className="text-field-ink/50 text-xs mt-1">
                      {a.readingTime}
                    </p>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Article */}
          <article className="flex-1 bg-white rounded-xl border border-field-brown/10 p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-field-ink mb-2">
              {selectedArticle.title}
            </h2>
            <p className="text-field-ink/50 text-sm mb-8">
              {selectedArticle.readingTime}
            </p>

            {selectedArticle.content.map((section, i) => (
              <div key={i} className="mb-8">
                {section.heading && (
                  <h3 className="text-lg font-semibold text-field-ink mb-3">
                    {section.heading}
                  </h3>
                )}
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="text-field-ink/70 leading-relaxed mb-4"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ))}

            {/* CTA */}
            <div className="mt-10 p-6 bg-field-forest/5 rounded-xl text-center">
              <p className="font-medium text-field-ink mb-2">
                Need help with your wildlife exemption?
              </p>
              <p className="text-field-ink/60 text-sm mb-4">
                FieldFile handles the tracking, documentation, and filing so you
                can focus on your property.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-field-forest text-white px-6 py-2 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-field-cream min-h-screen flex items-center justify-center">
          <p className="text-field-ink/50">Loading resources...</p>
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}

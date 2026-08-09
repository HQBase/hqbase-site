import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const questions = [
  {
    value: "deployment-requirements",
    question: "What do I need before deploying?",
    answer: (
      <p>
        Enable Workers Paid, activate the R2 subscription, and have an active domain using
        Cloudflare DNS. <a href="/docs/getting-started/">See the deployment guide.</a>
      </p>
    ),
  },
  {
    value: "agentic-inbox",
    question: "How is HQBase different from Cloudflare Agentic Inbox?",
    answer: (
      <p>
        They share a similar foundation: self-hosted email on Cloudflare with AI support. HQBase
        takes the idea further as a complete team email workspace, adding individual accounts,
        per-mailbox permissions, OAuth-scoped AI access, Web Push, audit history, multi-domain
        administration, and signed updates with backup and recovery. We encourage you to try
        Agentic Inbox as well.
      </p>
    ),
  },
  {
    value: "data-location",
    question: "Where does my data live?",
    answer: (
      <p>
        Your mail, app data, and secrets stay in your Cloudflare account. HQBase uses your Worker,
        D1 database, and R2 bucket. Your deployment is not registered with us, so we are not even
        aware that your installation exists.
      </p>
    ),
  },
  {
    value: "free-open-source",
    question: "Is HQBase fully free and open source?",
    answer: (
      <p>
        Yes. The complete HQBase product, including its OAuth relay, is public under AGPL-3.0-only.
        HQBase has no per-seat fees; you pay Cloudflare directly for the resources your deployment
        uses.
      </p>
    ),
  },
]

export function FaqSection() {
  return (
    <section
      className="page-section faq-section"
      id="faq"
      aria-labelledby="faq-title"
      data-reveal="up"
      suppressHydrationWarning
    >
      <div className="page-shell faq-layout">
        <div className="faq-heading">
          <h2 id="faq-title">Frequently asked questions</h2>
          <p>What to know before running HQBase in your Cloudflare account.</p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="deployment-requirements"
          className="faq-accordion"
        >
          {questions.map(({ value, question, answer }) => (
            <AccordionItem value={value} key={value}>
              <AccordionTrigger>
                <span className="faq-question">{question}</span>
              </AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

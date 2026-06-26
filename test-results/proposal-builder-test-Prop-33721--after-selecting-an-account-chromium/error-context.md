# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proposal-builder-test.spec.ts >> Proposal Builder - Step 4: Add Purpose >> adding a purpose after selecting an account
- Location: tests\proposal-builder-test.spec.ts:51:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: Test timeout of 60000ms exceeded.
Call log:
  - navigating to "https://test.getprudens.ai/aegis/proposal-builder", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - link "Prudens AI" [ref=e5] [cursor=pointer]:
      - /url: /prudens/home
      - img "Prudens AI" [ref=e6]
    - text: 
    - generic [ref=e7]:
      - generic [ref=e8]:
        - button "Close navigation" [expanded] [ref=e9] [cursor=pointer]:
          - generic [ref=e10]: 
        - list
        - list [ref=e11]:
          - listitem [ref=e12]:
            - button " VibeOps" [ref=e13] [cursor=pointer]:
              - generic [ref=e14]: 
              - generic [ref=e15]: VibeOps
            - text:        
        - text:  
      - generic [ref=e16]:
        - button "Open Aegis Copilot" [ref=e19] [cursor=pointer]:
          - img "Aegis orb launcher" [ref=e20]
        - generic [ref=e25]:
          - generic [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: 
            - generic [ref=e28]: 
          - text:  
  - generic [ref=e32]:
    - heading "Layout Options" [level=3] [ref=e33]
    - list [ref=e35]:
      - listitem [ref=e36]:
        - generic [ref=e38]:
          - checkbox [checked] [ref=e42]
          - generic [ref=e43]:
            - generic [ref=e44]: Fixed Header
            - generic [ref=e45]: Makes the header top fixed, always visible!
      - listitem [ref=e46]:
        - generic [ref=e48]:
          - checkbox [checked] [ref=e52]
          - generic [ref=e53]:
            - generic [ref=e54]: Fixed Sidebar
            - generic [ref=e55]: Makes the sidebar left fixed, always visible!
      - listitem [ref=e56]:
        - generic [ref=e58]:
          - checkbox [ref=e62]
          - generic [ref=e63]:
            - generic [ref=e64]: Fixed Footer
            - generic [ref=e65]: Makes the app footer bottom fixed, always visible!
    - heading "Header Options Restore Default" [level=3] [ref=e66]:
      - generic [ref=e67]: Header Options
      - button "Restore Default" [ref=e68] [cursor=pointer]
    - list [ref=e70]:
      - listitem [ref=e71]:
        - heading "Choose Color Scheme" [level=5] [ref=e72]
    - heading "Sidebar Options Restore Default" [level=3] [ref=e111]:
      - generic [ref=e112]: Sidebar Options
      - button "Restore Default" [ref=e113] [cursor=pointer]
    - list [ref=e115]:
      - listitem [ref=e116]:
        - heading "Choose Color Scheme" [level=5] [ref=e117]
    - heading "Main Content Options Restore Default" [level=3] [ref=e156]:
      - generic [ref=e157]: Main Content Options
      - button "Restore Default" [ref=e158] [cursor=pointer]
    - list [ref=e160]:
      - listitem [ref=e161]:
        - heading "Page Section Tabs" [level=5] [ref=e162]
        - group [ref=e164]:
          - button "Line" [ref=e165] [cursor=pointer]
          - button "Shadow" [ref=e166] [cursor=pointer]
  - generic [ref=e167]:
    - generic [ref=e168]:
      - text: 
      - list [ref=e171]:
        - listitem [ref=e172]: Prudens
        - listitem [ref=e173]:
          - link " Virtual Assistance " [ref=e174] [cursor=pointer]:
            - /url: "#"
            - generic [ref=e175]: 
            - text: Virtual Assistance
            - generic [ref=e176]: 
        - listitem [ref=e177]:
          - link " Ask Prudens" [ref=e178] [cursor=pointer]:
            - /url: https://test.getprudens.ai/virtual-assistant/ask-prudens
            - generic [ref=e179]: 
            - text: Ask Prudens
        - listitem [ref=e180]:
          - link " Policy Comparison" [ref=e181] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/policy-comparison
            - generic [ref=e182]: 
            - text: Policy Comparison
        - listitem [ref=e183]:
          - link " Proposal Builder" [ref=e184] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/proposal-builder
            - generic [ref=e185]: 
            - text: Proposal Builder
        - listitem [ref=e186]:
          - link " Form Automation " [ref=e187] [cursor=pointer]:
            - /url: "#"
            - generic [ref=e188]: 
            - text: Form Automation
            - generic [ref=e189]: 
          - text:   
        - listitem [ref=e190]:
          - link " Underwriting " [ref=e191] [cursor=pointer]:
            - /url: "#"
            - generic [ref=e192]: 
            - text: Underwriting
            - generic [ref=e193]: 
          - text:     
        - listitem [ref=e194]:
          - link " Binding and Billing  S-Admin  Locked" [ref=e195] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/binding-billing
            - generic [ref=e196]: 
            - text: Binding and Billing
            - generic [ref=e197]:
              - generic [ref=e198]: 
              - text: S-Admin
            - generic [ref=e199]:
              - generic [ref=e200]: 
              - text: Locked
        - listitem [ref=e201]:
          - link " COI, EOI and Endorsements  S-Admin" [ref=e202] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/coi-eoi-endorsements
            - generic [ref=e203]: 
            - text: COI, EOI and Endorsements
            - generic [ref=e204]:
              - generic [ref=e205]: 
              - text: S-Admin
        - listitem [ref=e206]:
          - link " FNOL Submissions  S-Admin" [ref=e207] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/fnol-submissions
            - generic [ref=e208]: 
            - text: FNOL Submissions
            - generic [ref=e209]:
              - generic [ref=e210]: 
              - text: S-Admin
        - listitem [ref=e211]:
          - link " CRM AMS Integration" [ref=e212] [cursor=pointer]:
            - /url: /aegis/integration
            - generic [ref=e213]: 
            - text: CRM AMS Integration
        - listitem [ref=e214]:
          - link " Invoice Creator" [ref=e215] [cursor=pointer]:
            - /url: https://test.getprudens.ai/invoice-creator
            - generic [ref=e216]: 
            - text: Invoice Creator
        - listitem [ref=e217]:
          - link " Settings  Admin" [ref=e218] [cursor=pointer]:
            - /url: /aegis/settings
            - generic [ref=e219]: 
            - text: Settings
            - generic [ref=e220]:
              - generic [ref=e221]: 
              - text: Admin
        - listitem [ref=e222]: Data
        - listitem [ref=e223]:
          - link " Account" [ref=e224] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/data/account
            - generic [ref=e225]: 
            - text: Account
        - listitem [ref=e226]:
          - link " Contact  S-Admin" [ref=e227] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/data/contact
            - generic [ref=e228]: 
            - text: Contact
            - generic [ref=e229]:
              - generic [ref=e230]: 
              - text: S-Admin
        - listitem [ref=e231]:
          - link " Providers  S-Admin" [ref=e232] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/data/providers
            - generic [ref=e233]: 
            - text: Providers
            - generic [ref=e234]:
              - generic [ref=e235]: 
              - text: S-Admin
        - listitem [ref=e236]:
          - link " Explore  S-Admin" [ref=e237] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/data/explore
            - generic [ref=e238]: 
            - text: Explore
            - generic [ref=e239]:
              - generic [ref=e240]: 
              - text: S-Admin
        - listitem [ref=e241]:
          - link " Product Line  S-Admin" [ref=e242] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/data/product-line
            - generic [ref=e243]: 
            - text: Product Line
            - generic [ref=e244]:
              - generic [ref=e245]: 
              - text: S-Admin
        - listitem [ref=e246] [cursor=pointer]:
          - text: Aegis
          - generic [ref=e247]:
            - generic [ref=e248]: 
            - text: S-Admin
          - generic [ref=e249]: 
        - text:                
        - listitem [ref=e250]:
          - text: Configuration
          - generic [ref=e251]:
            - generic [ref=e252]: 
            - text: S-Admin
        - listitem [ref=e253]:
          - link " Companies" [ref=e254] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/configuration/companies
            - generic [ref=e255]: 
            - text: Companies
        - listitem [ref=e256]:
          - link " Payments" [ref=e257] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/configuration/payments
            - generic [ref=e258]: 
            - text: Payments
        - listitem [ref=e259]:
          - link " Configuration " [ref=e260] [cursor=pointer]:
            - /url: "#"
            - generic [ref=e261]: 
            - text: Configuration
            - generic [ref=e262]: 
          - text:                  
        - listitem [ref=e263]:
          - text: Experimental
          - generic [ref=e264]:
            - generic [ref=e265]: 
            - text: S-Admin
        - listitem [ref=e266]:
          - link " Ask Prudens Concept" [ref=e267] [cursor=pointer]:
            - /url: https://test.getprudens.ai/ask-prudens-chat
            - generic [ref=e268]: 
            - text: Ask Prudens
            - generic [ref=e269]: Concept
        - listitem [ref=e270]:
          - link " AL3 Converter" [ref=e271] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/data/al3-converter
            - generic [ref=e272]: 
            - text: AL3 Converter
        - listitem [ref=e273]:
          - link " SMS Testing" [ref=e274] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/sms-testing
            - generic [ref=e275]: 
            - text: SMS Testing
        - listitem [ref=e276]:
          - link " Company Website Factory" [ref=e277] [cursor=pointer]:
            - /url: https://test.getprudens.ai/aegis/company-website
            - generic [ref=e278]: 
            - text: Company Website
            - generic [ref=e279]: Factory
        - listitem [ref=e280]:
          - link " Client Portal" [ref=e281] [cursor=pointer]:
            - /url: https://test.getprudens.ai/clientportal
            - generic [ref=e282]: 
            - text: Client Portal
    - generic [ref=e284]:
      - generic [ref=e287]:
        - generic [ref=e289]: 
        - generic [ref=e290]:
          - text: Proposal Builder
          - generic [ref=e291]: Create and send professional insurance proposals.
      - generic [ref=e293]:
        - generic [ref=e294]:
          - heading "Proposals" [level=5] [ref=e295]
          - button "+ New" [ref=e297] [cursor=pointer]:
            - generic [ref=e298]: +
            - text: New
        - table [ref=e301]:
          - rowgroup [ref=e302]:
            - row "Account Name Status Created Actions" [ref=e303]:
              - columnheader "Account" [ref=e304]
              - columnheader "Name" [ref=e305]
              - columnheader "Status" [ref=e306]
              - columnheader "Created" [ref=e307]
              - columnheader "Actions" [ref=e308]
          - rowgroup [ref=e309]:
            - row "June 9 QA Proposal June 9 QA 2026-06-08 21:59 Generated Jun 9, 2026, 11:59 AM   " [ref=e310]:
              - cell "June 9 QA" [ref=e311]
              - cell "Proposal June 9 QA 2026-06-08 21:59" [ref=e312]
              - cell "Generated" [ref=e313]:
                - button "Generated" [ref=e315] [cursor=pointer]:
                  - generic [ref=e316]: Generated
              - cell "Jun 9, 2026, 11:59 AM" [ref=e317]
              - cell "  " [ref=e318]:
                - button "" [ref=e319] [cursor=pointer]:
                  - generic [ref=e320]: 
                - button "" [ref=e321] [cursor=pointer]:
                  - generic [ref=e322]: 
                - button "" [ref=e323] [cursor=pointer]:
                  - generic [ref=e324]: 
            - row "Proposal Test Proposal Proposal Test 2026-05-20 07:33 Viewed  May 20, 2026, 9:40 PM May 20, 2026, 9:33 PM   " [ref=e325]:
              - cell "Proposal Test" [ref=e326]
              - cell "Proposal Proposal Test 2026-05-20 07:33" [ref=e327]
              - cell "Viewed  May 20, 2026, 9:40 PM" [ref=e328]:
                - button "Viewed" [ref=e330] [cursor=pointer]:
                  - generic [ref=e331]: Viewed
                - generic [ref=e332]:
                  - generic [ref=e333]: 
                  - text: May 20, 2026, 9:40 PM
              - cell "May 20, 2026, 9:33 PM" [ref=e334]
              - cell "  " [ref=e335]:
                - button "" [ref=e336] [cursor=pointer]:
                  - generic [ref=e337]: 
                - button "" [ref=e338] [cursor=pointer]:
                  - generic [ref=e339]: 
                - button "" [ref=e340] [cursor=pointer]:
                  - generic [ref=e341]: 
            - row "QA2D Proposal QA2D 2026-05-13 08:47 Viewed  May 15, 2026, 4:54 PM May 13, 2026, 10:47 PM   " [ref=e342]:
              - cell "QA2D" [ref=e343]
              - cell "Proposal QA2D 2026-05-13 08:47" [ref=e344]
              - cell "Viewed  May 15, 2026, 4:54 PM" [ref=e345]:
                - button "Viewed" [ref=e347] [cursor=pointer]:
                  - generic [ref=e348]: Viewed
                - generic [ref=e349]:
                  - generic [ref=e350]: 
                  - text: May 15, 2026, 4:54 PM
              - cell "May 13, 2026, 10:47 PM" [ref=e351]
              - cell "  " [ref=e352]:
                - button "" [ref=e353] [cursor=pointer]:
                  - generic [ref=e354]: 
                - button "" [ref=e355] [cursor=pointer]:
                  - generic [ref=e356]: 
                - button "" [ref=e357] [cursor=pointer]:
                  - generic [ref=e358]: 
            - row "QA4 Proposal QA4 2026-05-13 08:33 Viewed  May 13, 2026, 10:34 PM May 13, 2026, 10:33 PM   " [ref=e359]:
              - cell "QA4" [ref=e360]
              - cell "Proposal QA4 2026-05-13 08:33" [ref=e361]
              - cell "Viewed  May 13, 2026, 10:34 PM" [ref=e362]:
                - button "Viewed" [ref=e364] [cursor=pointer]:
                  - generic [ref=e365]: Viewed
                - generic [ref=e366]:
                  - generic [ref=e367]: 
                  - text: May 13, 2026, 10:34 PM
              - cell "May 13, 2026, 10:33 PM" [ref=e368]
              - cell "  " [ref=e369]:
                - button "" [ref=e370] [cursor=pointer]:
                  - generic [ref=e371]: 
                - button "" [ref=e372] [cursor=pointer]:
                  - generic [ref=e373]: 
                - button "" [ref=e374] [cursor=pointer]:
                  - generic [ref=e375]: 
            - row "Comparison Demo Proposal Comparison Demo 2026-05-13 08:02 Generated May 13, 2026, 10:02 PM   " [ref=e376]:
              - cell "Comparison Demo" [ref=e377]
              - cell "Proposal Comparison Demo 2026-05-13 08:02" [ref=e378]
              - cell "Generated" [ref=e379]:
                - button "Generated" [ref=e381] [cursor=pointer]:
                  - generic [ref=e382]: Generated
              - cell "May 13, 2026, 10:02 PM" [ref=e383]
              - cell "  " [ref=e384]:
                - button "" [ref=e385] [cursor=pointer]:
                  - generic [ref=e386]: 
                - button "" [ref=e387] [cursor=pointer]:
                  - generic [ref=e388]: 
                - button "" [ref=e389] [cursor=pointer]:
                  - generic [ref=e390]: 
            - row "- Proposal 2026-05-13 07:56 Generated May 13, 2026, 9:56 PM   " [ref=e391]:
              - cell "-" [ref=e392]
              - cell "Proposal 2026-05-13 07:56" [ref=e393]
              - cell "Generated" [ref=e394]:
                - button "Generated" [ref=e396] [cursor=pointer]:
                  - generic [ref=e397]: Generated
              - cell "May 13, 2026, 9:56 PM" [ref=e398]
              - cell "  " [ref=e399]:
                - button "" [ref=e400] [cursor=pointer]:
                  - generic [ref=e401]: 
                - button "" [ref=e402] [cursor=pointer]:
                  - generic [ref=e403]: 
                - button "" [ref=e404] [cursor=pointer]:
                  - generic [ref=e405]: 
            - row "Comparison Demo Proposal Comparison Demo 2026-05-13 07:51 Generated May 13, 2026, 9:51 PM   " [ref=e406]:
              - cell "Comparison Demo" [ref=e407]
              - cell "Proposal Comparison Demo 2026-05-13 07:51" [ref=e408]
              - cell "Generated" [ref=e409]:
                - button "Generated" [ref=e411] [cursor=pointer]:
                  - generic [ref=e412]: Generated
              - cell "May 13, 2026, 9:51 PM" [ref=e413]
              - cell "  " [ref=e414]:
                - button "" [ref=e415] [cursor=pointer]:
                  - generic [ref=e416]: 
                - button "" [ref=e417] [cursor=pointer]:
                  - generic [ref=e418]: 
                - button "" [ref=e419] [cursor=pointer]:
                  - generic [ref=e420]: 
            - row "QA2D Proposal QA2D 2026-05-13 01:02 Sent May 13, 2026, 3:02 PM   " [ref=e421]:
              - cell "QA2D" [ref=e422]
              - cell "Proposal QA2D 2026-05-13 01:02" [ref=e423]
              - cell "Sent" [ref=e424]:
                - button "Sent" [ref=e426] [cursor=pointer]:
                  - generic [ref=e427]: Sent
              - cell "May 13, 2026, 3:02 PM" [ref=e428]
              - cell "  " [ref=e429]:
                - button "" [ref=e430] [cursor=pointer]:
                  - generic [ref=e431]: 
                - button "" [ref=e432] [cursor=pointer]:
                  - generic [ref=e433]: 
                - button "" [ref=e434] [cursor=pointer]:
                  - generic [ref=e435]: 
            - row "QA4 Proposal QA4 2026-05-12 08:06 Sent May 12, 2026, 10:06 PM   " [ref=e436]:
              - cell "QA4" [ref=e437]
              - cell "Proposal QA4 2026-05-12 08:06" [ref=e438]
              - cell "Sent" [ref=e439]:
                - button "Sent" [ref=e441] [cursor=pointer]:
                  - generic [ref=e442]: Sent
              - cell "May 12, 2026, 10:06 PM" [ref=e443]
              - cell "  " [ref=e444]:
                - button "" [ref=e445] [cursor=pointer]:
                  - generic [ref=e446]: 
                - button "" [ref=e447] [cursor=pointer]:
                  - generic [ref=e448]: 
                - button "" [ref=e449] [cursor=pointer]:
                  - generic [ref=e450]: 
            - row "QA5 Proposal QA5 2026-05-12 08:02 Viewed  May 12, 2026, 10:03 PM May 12, 2026, 10:02 PM   " [ref=e451]:
              - cell "QA5" [ref=e452]
              - cell "Proposal QA5 2026-05-12 08:02" [ref=e453]
              - cell "Viewed  May 12, 2026, 10:03 PM" [ref=e454]:
                - button "Viewed" [ref=e456] [cursor=pointer]:
                  - generic [ref=e457]: Viewed
                - generic [ref=e458]:
                  - generic [ref=e459]: 
                  - text: May 12, 2026, 10:03 PM
              - cell "May 12, 2026, 10:02 PM" [ref=e460]
              - cell "  " [ref=e461]:
                - button "" [ref=e462] [cursor=pointer]:
                  - generic [ref=e463]: 
                - button "" [ref=e464] [cursor=pointer]:
                  - generic [ref=e465]: 
                - button "" [ref=e466] [cursor=pointer]:
                  - generic [ref=e467]: 
            - row "QA5 Proposal QA5 2026-05-12 07:35 Sent May 12, 2026, 9:35 PM   " [ref=e468]:
              - cell "QA5" [ref=e469]
              - cell "Proposal QA5 2026-05-12 07:35" [ref=e470]
              - cell "Sent" [ref=e471]:
                - button "Sent" [ref=e473] [cursor=pointer]:
                  - generic [ref=e474]: Sent
              - cell "May 12, 2026, 9:35 PM" [ref=e475]
              - cell "  " [ref=e476]:
                - button "" [ref=e477] [cursor=pointer]:
                  - generic [ref=e478]: 
                - button "" [ref=e479] [cursor=pointer]:
                  - generic [ref=e480]: 
                - button "" [ref=e481] [cursor=pointer]:
                  - generic [ref=e482]: 
            - row "Demo Proposal Demo 2026-05-11 01:25 Generated May 11, 2026, 3:25 PM   " [ref=e483]:
              - cell "Demo" [ref=e484]
              - cell "Proposal Demo 2026-05-11 01:25" [ref=e485]
              - cell "Generated" [ref=e486]:
                - button "Generated" [ref=e488] [cursor=pointer]:
                  - generic [ref=e489]: Generated
              - cell "May 11, 2026, 3:25 PM" [ref=e490]
              - cell "  " [ref=e491]:
                - button "" [ref=e492] [cursor=pointer]:
                  - generic [ref=e493]: 
                - button "" [ref=e494] [cursor=pointer]:
                  - generic [ref=e495]: 
                - button "" [ref=e496] [cursor=pointer]:
                  - generic [ref=e497]: 
            - row "Comparison Demo Proposal Comparison Demo 2026-05-08 01:42 Viewed  May 8, 2026, 4:33 PM May 8, 2026, 3:42 PM   " [ref=e498]:
              - cell "Comparison Demo" [ref=e499]
              - cell "Proposal Comparison Demo 2026-05-08 01:42" [ref=e500]
              - cell "Viewed  May 8, 2026, 4:33 PM" [ref=e501]:
                - button "Viewed" [ref=e503] [cursor=pointer]:
                  - generic [ref=e504]: Viewed
                - generic [ref=e505]:
                  - generic [ref=e506]: 
                  - text: May 8, 2026, 4:33 PM
              - cell "May 8, 2026, 3:42 PM" [ref=e507]
              - cell "  " [ref=e508]:
                - button "" [ref=e509] [cursor=pointer]:
                  - generic [ref=e510]: 
                - button "" [ref=e511] [cursor=pointer]:
                  - generic [ref=e512]: 
                - button "" [ref=e513] [cursor=pointer]:
                  - generic [ref=e514]: 
            - row "QA Proposal QA 2026-05-08 01:23 Accepted  May 8, 2026, 3:25 PM May 8, 2026, 3:23 PM    " [ref=e515]:
              - cell "QA" [ref=e516]
              - cell "Proposal QA 2026-05-08 01:23" [ref=e517]
              - cell "Accepted  May 8, 2026, 3:25 PM" [ref=e518]:
                - button "Accepted" [ref=e520] [cursor=pointer]:
                  - generic [ref=e521]: Accepted
                - generic [ref=e522]:
                  - generic [ref=e523]: 
                  - text: May 8, 2026, 3:25 PM
              - cell "May 8, 2026, 3:23 PM" [ref=e524]
              - cell "   " [ref=e525]:
                - button "" [ref=e526] [cursor=pointer]:
                  - generic [ref=e527]: 
                - button "" [ref=e528] [cursor=pointer]:
                  - generic [ref=e529]: 
                - button "" [ref=e530] [cursor=pointer]:
                  - generic [ref=e531]: 
                - button "" [ref=e532] [cursor=pointer]:
                  - generic [ref=e533]: 
            - row "QA Proposal QA 2026-04-30 01:11 Sent Apr 30, 2026, 3:11 PM   " [ref=e534]:
              - cell "QA" [ref=e535]
              - cell "Proposal QA 2026-04-30 01:11" [ref=e536]
              - cell "Sent" [ref=e537]:
                - button "Sent" [ref=e539] [cursor=pointer]:
                  - generic [ref=e540]: Sent
              - cell "Apr 30, 2026, 3:11 PM" [ref=e541]
              - cell "  " [ref=e542]:
                - button "" [ref=e543] [cursor=pointer]:
                  - generic [ref=e544]: 
                - button "" [ref=e545] [cursor=pointer]:
                  - generic [ref=e546]: 
                - button "" [ref=e547] [cursor=pointer]:
                  - generic [ref=e548]: 
            - row "QA Proposal QA 2026-04-30 01:11 Accepted  May 6, 2026, 11:05 PM Apr 30, 2026, 3:11 PM    " [ref=e549]:
              - cell "QA" [ref=e550]
              - cell "Proposal QA 2026-04-30 01:11" [ref=e551]
              - cell "Accepted  May 6, 2026, 11:05 PM" [ref=e552]:
                - button "Accepted" [ref=e554] [cursor=pointer]:
                  - generic [ref=e555]: Accepted
                - generic [ref=e556]:
                  - generic [ref=e557]: 
                  - text: May 6, 2026, 11:05 PM
              - cell "Apr 30, 2026, 3:11 PM" [ref=e558]
              - cell "   " [ref=e559]:
                - button "" [ref=e560] [cursor=pointer]:
                  - generic [ref=e561]: 
                - button "" [ref=e562] [cursor=pointer]:
                  - generic [ref=e563]: 
                - button "" [ref=e564] [cursor=pointer]:
                  - generic [ref=e565]: 
                - button "" [ref=e566] [cursor=pointer]:
                  - generic [ref=e567]: 
            - row "- Proposal 2026-04-30 01:08 Sent Apr 30, 2026, 3:08 PM   " [ref=e568]:
              - cell "-" [ref=e569]
              - cell "Proposal 2026-04-30 01:08" [ref=e570]
              - cell "Sent" [ref=e571]:
                - button "Sent" [ref=e573] [cursor=pointer]:
                  - generic [ref=e574]: Sent
              - cell "Apr 30, 2026, 3:08 PM" [ref=e575]
              - cell "  " [ref=e576]:
                - button "" [ref=e577] [cursor=pointer]:
                  - generic [ref=e578]: 
                - button "" [ref=e579] [cursor=pointer]:
                  - generic [ref=e580]: 
                - button "" [ref=e581] [cursor=pointer]:
                  - generic [ref=e582]: 
            - row "QA Proposal QA 2026-04-30 01:05 Generated Apr 30, 2026, 3:05 PM   " [ref=e583]:
              - cell "QA" [ref=e584]
              - cell "Proposal QA 2026-04-30 01:05" [ref=e585]
              - cell "Generated" [ref=e586]:
                - button "Generated" [ref=e588] [cursor=pointer]:
                  - generic [ref=e589]: Generated
              - cell "Apr 30, 2026, 3:05 PM" [ref=e590]
              - cell "  " [ref=e591]:
                - button "" [ref=e592] [cursor=pointer]:
                  - generic [ref=e593]: 
                - button "" [ref=e594] [cursor=pointer]:
                  - generic [ref=e595]: 
                - button "" [ref=e596] [cursor=pointer]:
                  - generic [ref=e597]: 
            - row "QA Proposal QA 2026-04-30 00:54 Viewed  May 13, 2026, 12:31 PM Apr 30, 2026, 2:54 PM   " [ref=e598]:
              - cell "QA" [ref=e599]
              - cell "Proposal QA 2026-04-30 00:54" [ref=e600]
              - cell "Viewed  May 13, 2026, 12:31 PM" [ref=e601]:
                - button "Viewed" [ref=e603] [cursor=pointer]:
                  - generic [ref=e604]: Viewed
                - generic [ref=e605]:
                  - generic [ref=e606]: 
                  - text: May 13, 2026, 12:31 PM
              - cell "Apr 30, 2026, 2:54 PM" [ref=e607]
              - cell "  " [ref=e608]:
                - button "" [ref=e609] [cursor=pointer]:
                  - generic [ref=e610]: 
                - button "" [ref=e611] [cursor=pointer]:
                  - generic [ref=e612]: 
                - button "" [ref=e613] [cursor=pointer]:
                  - generic [ref=e614]: 
            - row "QA Proposal QA 2026-04-30 00:29 Generated Apr 30, 2026, 2:29 PM   " [ref=e615]:
              - cell "QA" [ref=e616]
              - cell "Proposal QA 2026-04-30 00:29" [ref=e617]
              - cell "Generated" [ref=e618]:
                - button "Generated" [ref=e620] [cursor=pointer]:
                  - generic [ref=e621]: Generated
              - cell "Apr 30, 2026, 2:29 PM" [ref=e622]
              - cell "  " [ref=e623]:
                - button "" [ref=e624] [cursor=pointer]:
                  - generic [ref=e625]: 
                - button "" [ref=e626] [cursor=pointer]:
                  - generic [ref=e627]: 
                - button "" [ref=e628] [cursor=pointer]:
                  - generic [ref=e629]: 
            - row "Behar Demo Test Proposal 2026-04-23 09:03 Generated Apr 23, 2026, 11:03 PM   " [ref=e630]:
              - cell "Behar Demo Test" [ref=e631]
              - cell "Proposal 2026-04-23 09:03" [ref=e632]
              - cell "Generated" [ref=e633]:
                - button "Generated" [ref=e635] [cursor=pointer]:
                  - generic [ref=e636]: Generated
              - cell "Apr 23, 2026, 11:03 PM" [ref=e637]
              - cell "  " [ref=e638]:
                - button "" [ref=e639] [cursor=pointer]:
                  - generic [ref=e640]: 
                - button "" [ref=e641] [cursor=pointer]:
                  - generic [ref=e642]: 
                - button "" [ref=e643] [cursor=pointer]:
                  - generic [ref=e644]: 
            - row "QA 1 Proposal QA 1 2026-04-23 08:36 Generated Apr 23, 2026, 10:36 PM   " [ref=e645]:
              - cell "QA 1" [ref=e646]
              - cell "Proposal QA 1 2026-04-23 08:36" [ref=e647]
              - cell "Generated" [ref=e648]:
                - button "Generated" [ref=e650] [cursor=pointer]:
                  - generic [ref=e651]: Generated
              - cell "Apr 23, 2026, 10:36 PM" [ref=e652]
              - cell "  " [ref=e653]:
                - button "" [ref=e654] [cursor=pointer]:
                  - generic [ref=e655]: 
                - button "" [ref=e656] [cursor=pointer]:
                  - generic [ref=e657]: 
                - button "" [ref=e658] [cursor=pointer]:
                  - generic [ref=e659]: 
            - row "QAB Proposal QA 2026-04-23 01:57 Generated Apr 23, 2026, 3:57 PM   " [ref=e660]:
              - cell "QAB" [ref=e661]
              - cell "Proposal QA 2026-04-23 01:57" [ref=e662]
              - cell "Generated" [ref=e663]:
                - button "Generated" [ref=e665] [cursor=pointer]:
                  - generic [ref=e666]: Generated
              - cell "Apr 23, 2026, 3:57 PM" [ref=e667]
              - cell "  " [ref=e668]:
                - button "" [ref=e669] [cursor=pointer]:
                  - generic [ref=e670]: 
                - button "" [ref=e671] [cursor=pointer]:
                  - generic [ref=e672]: 
                - button "" [ref=e673] [cursor=pointer]:
                  - generic [ref=e674]: 
            - row "QA Proposal QA 2026-04-23 01:5111qabc Accepted  Apr 23, 2026, 3:58 PM Apr 23, 2026, 3:51 PM    " [ref=e675]:
              - cell "QA" [ref=e676]
              - cell "Proposal QA 2026-04-23 01:5111qabc" [ref=e677]
              - cell "Accepted  Apr 23, 2026, 3:58 PM" [ref=e678]:
                - button "Accepted" [ref=e680] [cursor=pointer]:
                  - generic [ref=e681]: Accepted
                - generic [ref=e682]:
                  - generic [ref=e683]: 
                  - text: Apr 23, 2026, 3:58 PM
              - cell "Apr 23, 2026, 3:51 PM" [ref=e684]
              - cell "   " [ref=e685]:
                - button "" [ref=e686] [cursor=pointer]:
                  - generic [ref=e687]: 
                - button "" [ref=e688] [cursor=pointer]:
                  - generic [ref=e689]: 
                - button "" [ref=e690] [cursor=pointer]:
                  - generic [ref=e691]: 
                - button "" [ref=e692] [cursor=pointer]:
                  - generic [ref=e693]: 
            - row "Jill A and A Proposal Jill A and A 2026-04-10 11:40 Generated Apr 11, 2026, 1:40 AM   " [ref=e694]:
              - cell "Jill A and A" [ref=e695]
              - cell "Proposal Jill A and A 2026-04-10 11:40" [ref=e696]
              - cell "Generated" [ref=e697]:
                - button "Generated" [ref=e699] [cursor=pointer]:
                  - generic [ref=e700]: Generated
              - cell "Apr 11, 2026, 1:40 AM" [ref=e701]
              - cell "  " [ref=e702]:
                - button "" [ref=e703] [cursor=pointer]:
                  - generic [ref=e704]: 
                - button "" [ref=e705] [cursor=pointer]:
                  - generic [ref=e706]: 
                - button "" [ref=e707] [cursor=pointer]:
                  - generic [ref=e708]: 
            - row "CTG - Martin Proposal CTG - Martin 2026-04-09 22:06 Viewed  Apr 10, 2026, 12:09 PM Apr 10, 2026, 12:06 PM   " [ref=e709]:
              - cell "CTG - Martin" [ref=e710]
              - cell "Proposal CTG - Martin 2026-04-09 22:06" [ref=e711]
              - cell "Viewed  Apr 10, 2026, 12:09 PM" [ref=e712]:
                - button "Viewed" [ref=e714] [cursor=pointer]:
                  - generic [ref=e715]: Viewed
                - generic [ref=e716]:
                  - generic [ref=e717]: 
                  - text: Apr 10, 2026, 12:09 PM
              - cell "Apr 10, 2026, 12:06 PM" [ref=e718]
              - cell "  " [ref=e719]:
                - button "" [ref=e720] [cursor=pointer]:
                  - generic [ref=e721]: 
                - button "" [ref=e722] [cursor=pointer]:
                  - generic [ref=e723]: 
                - button "" [ref=e724] [cursor=pointer]:
                  - generic [ref=e725]: 
            - row "Jill Proposal Jill 2026-04-09 19:12 Viewed  Apr 10, 2026, 9:12 AM Apr 10, 2026, 9:12 AM   " [ref=e726]:
              - cell "Jill" [ref=e727]
              - cell "Proposal Jill 2026-04-09 19:12" [ref=e728]
              - cell "Viewed  Apr 10, 2026, 9:12 AM" [ref=e729]:
                - button "Viewed" [ref=e731] [cursor=pointer]:
                  - generic [ref=e732]: Viewed
                - generic [ref=e733]:
                  - generic [ref=e734]: 
                  - text: Apr 10, 2026, 9:12 AM
              - cell "Apr 10, 2026, 9:12 AM" [ref=e735]
              - cell "  " [ref=e736]:
                - button "" [ref=e737] [cursor=pointer]:
                  - generic [ref=e738]: 
                - button "" [ref=e739] [cursor=pointer]:
                  - generic [ref=e740]: 
                - button "" [ref=e741] [cursor=pointer]:
                  - generic [ref=e742]: 
            - row "Jill Proposal Jill 2026-03-30 23:14 Viewed  May 13, 2026, 12:50 PM Mar 31, 2026, 1:14 PM   " [ref=e743]:
              - cell "Jill" [ref=e744]
              - cell "Proposal Jill 2026-03-30 23:14" [ref=e745]
              - cell "Viewed  May 13, 2026, 12:50 PM" [ref=e746]:
                - button "Viewed" [ref=e748] [cursor=pointer]:
                  - generic [ref=e749]: Viewed
                - generic [ref=e750]:
                  - generic [ref=e751]: 
                  - text: May 13, 2026, 12:50 PM
              - cell "Mar 31, 2026, 1:14 PM" [ref=e752]
              - cell "  " [ref=e753]:
                - button "" [ref=e754] [cursor=pointer]:
                  - generic [ref=e755]: 
                - button "" [ref=e756] [cursor=pointer]:
                  - generic [ref=e757]: 
                - button "" [ref=e758] [cursor=pointer]:
                  - generic [ref=e759]: 
            - row "TEST COMP 1 Proposal TEST COMP 1 2026-03-20 08:00 Draft Mar 20, 2026, 10:00 PM   " [ref=e760]:
              - cell "TEST COMP 1" [ref=e761]
              - cell "Proposal TEST COMP 1 2026-03-20 08:00" [ref=e762]
              - cell "Draft" [ref=e763]:
                - button "Draft" [ref=e765] [cursor=pointer]:
                  - generic [ref=e766]: Draft
              - cell "Mar 20, 2026, 10:00 PM" [ref=e767]
              - cell "  " [ref=e768]:
                - button "" [ref=e769] [cursor=pointer]:
                  - generic [ref=e770]: 
                - button "" [ref=e771] [cursor=pointer]:
                  - generic [ref=e772]: 
                - button "" [ref=e773] [cursor=pointer]:
                  - generic [ref=e774]: 
            - row "TEST COMP 1 RENAMED PROPOSAL ALEX Viewed  Feb 20, 2026, 11:17 PM Feb 20, 2026, 11:15 PM   " [ref=e775]:
              - cell "TEST COMP 1" [ref=e776]
              - cell "RENAMED PROPOSAL ALEX" [ref=e777]
              - cell "Viewed  Feb 20, 2026, 11:17 PM" [ref=e778]:
                - button "Viewed" [ref=e780] [cursor=pointer]:
                  - generic [ref=e781]: Viewed
                - generic [ref=e782]:
                  - generic [ref=e783]: 
                  - text: Feb 20, 2026, 11:17 PM
              - cell "Feb 20, 2026, 11:15 PM" [ref=e784]
              - cell "  " [ref=e785]:
                - button "" [ref=e786] [cursor=pointer]:
                  - generic [ref=e787]: 
                - button "" [ref=e788] [cursor=pointer]:
                  - generic [ref=e789]: 
                - button "" [ref=e790] [cursor=pointer]:
                  - generic [ref=e791]: 
            - row "Comparison Demo - Archived Jan 27, 2026, 12:39 PM   " [ref=e792]:
              - cell "Comparison Demo" [ref=e793]
              - cell "-" [ref=e794]
              - cell "Archived" [ref=e795]:
                - button "Archived" [ref=e797] [cursor=pointer]:
                  - generic [ref=e798]: Archived
              - cell "Jan 27, 2026, 12:39 PM" [ref=e799]
              - cell "  " [ref=e800]:
                - button "" [ref=e801] [cursor=pointer]:
                  - generic [ref=e802]: 
                - button "" [ref=e803] [cursor=pointer]:
                  - generic [ref=e804]: 
                - button "" [ref=e805] [cursor=pointer]:
                  - generic [ref=e806]: 
```

# Test source

```ts
  1  | import { expect, type Locator, type Page } from '@playwright/test';
  2  | 
  3  | export class ProposalBuilderPage {
  4  |   readonly page: Page;
  5  |   readonly newButton: Locator;
  6  |   readonly addNewAccountButton: Locator;
  7  |   readonly createAccountPanel: Locator;
  8  |   readonly accountNameInput: Locator;
  9  |   readonly createButton: Locator;
  10 |   readonly purposeInput: Locator;
  11 |   readonly accountCombobox: Locator;
  12 | 
  13 |   constructor(page: Page) {
  14 |     this.page = page;
  15 |     this.newButton = page.locator('button:has-text("+ New"), button:has-text("New")').first();
  16 |     this.addNewAccountButton = page.locator('button:has-text("+ Add New Account"), button:has-text("Add New Account")').first();
  17 |     this.createAccountPanel = page.locator('text=Create New Account').first().locator('xpath=ancestor::div[1]');
  18 |     this.accountNameInput = this.createAccountPanel.locator('input').first();
  19 |     this.createButton = this.createAccountPanel.getByRole('button', { name: /create/i }).first();
  20 |     this.purposeInput = page.locator(
  21 |       'textarea[placeholder*="Annual renewal proposal"], input[placeholder*="Annual renewal proposal"], textarea[aria-label*="Purpose"], input[aria-label*="Purpose"]'
  22 |     ).first();
  23 |     this.accountCombobox = page.getByPlaceholder('Select or search account...');
  24 |   }
  25 | 
  26 |   async goto() {
> 27 |     await this.page.goto('https://test.getprudens.ai/aegis/proposal-builder', { timeout: 120000 });
     |                     ^ Error: page.goto: Test timeout of 60000ms exceeded.
  28 |     await this.page.waitForURL(/\/aegis\/proposal-builder/);
  29 |     await this.page.waitForLoadState('networkidle');
  30 |   }
  31 | 
  32 |   async openNewProposal() {
  33 |     await expect(this.newButton).toBeVisible();
  34 |     await expect(this.newButton).toBeEnabled();
  35 |     await this.newButton.click();
  36 |   }
  37 | 
  38 |   async addNewAccount(accountName: string) {
  39 |     await expect(this.addNewAccountButton).toBeVisible();
  40 |     await this.addNewAccountButton.click();
  41 |     await expect(this.createAccountPanel).toBeVisible();
  42 |     await expect(this.accountNameInput).toBeVisible();
  43 |     await this.accountNameInput.fill(accountName);
  44 |     await expect(this.accountNameInput).toHaveValue(accountName);
  45 |     await expect(this.createButton).toBeEnabled();
  46 |     await this.createButton.click();
  47 | 
  48 |     const accountCreatedDialog = this.page.locator('text=Account created').first();
  49 |     await expect(accountCreatedDialog).toBeVisible({ timeout: 10000 });
  50 | 
  51 |     const accountCreatedOkButton = this.page.getByRole('button', { name: /OK/ }).first();
  52 |     await expect(accountCreatedOkButton).toBeVisible();
  53 |     await expect(accountCreatedOkButton).toBeEnabled();
  54 |     await accountCreatedOkButton.click();
  55 | 
  56 |     await expect(accountCreatedDialog).toBeHidden();
  57 |     await this.page.waitForLoadState('networkidle');
  58 |   }
  59 | 
  60 |   async fillPurpose(purposeText: string) {
  61 |     await expect(this.purposeInput).toBeVisible();
  62 |     await this.purposeInput.fill(purposeText);
  63 |     await expect(this.purposeInput).toHaveValue(purposeText);
  64 |   }
  65 | 
  66 |   async selectAccount(accountName: string) {
  67 |     await expect(this.accountCombobox).toBeVisible();
  68 |     await this.accountCombobox.click();
  69 |     await this.page.waitForTimeout(500);
  70 | 
  71 |     const accountOption = this.page.locator('[role="option"], [role="listbox"] li, div[role="listbox"] > div').filter({ hasText: accountName }).first();
  72 |     await expect(accountOption).toBeVisible({ timeout: 10000 });
  73 |     await accountOption.click();
  74 |     await this.page.waitForLoadState('networkidle');
  75 |   }
  76 | 
  77 |   async addDocuments(filePaths: string[]) {
  78 |     await this.page.getByRole('button', { name: '+ New' }).click();
  79 |     await this.page.getByText('Document', { exact: true }).click();
  80 |     const fileInput = this.page.locator('input[type="file"]');
  81 |     await fileInput.setInputFiles(filePaths);
  82 |     await expect(this.page.getByText(filePaths[0].split('/').pop() || filePaths[0])).toBeVisible();
  83 |     await this.page.getByRole('button', { name: /Upload/i }).click();
  84 |     await expect(this.page.locator('h3').filter({ hasText: 'Processing Document' })).toBeVisible();
  85 |     await expect(this.page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 60000 });
  86 |     await this.page.getByRole('button', { name: 'Done' }).click();
  87 |     await this.page.waitForLoadState('networkidle');
  88 |   }
  89 | 
  90 |   async generateProposal() {
  91 |     const generateButton = this.page.locator('button:has-text("Generate Proposal"), button:has-text("generate proposal")').first();
  92 |     await expect(generateButton).toBeVisible();
  93 |     await expect(generateButton).toBeEnabled();
  94 |     await generateButton.click();
  95 |     await this.page.waitForLoadState('networkidle');
  96 |   }
  97 | }
  98 | 
```
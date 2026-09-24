Revise the gameplay around a satisfying **play → earn Coins → recruit and upgrade → take on tougher patrols** loop. Implement this in the existing game, preserving its polished kawaii aesthetic, recognizable biology, and responsive controls.

1. **Let players build their patrol.** Before each level, let players choose and combine unlocked host defenders rather than selecting only one lead type. Include neutrophils, macrophages, plasma cells, and other appropriate defenders as progression expands. Make squad composition easy to understand, with visible capacity, clear roles, and quick teammate swapping.

2. **Offer distinctive neutrophil options.** Include several neutrophil play styles with catchy nicknames, recognizable appearances, and meaningful differences in movement, approach reach, engulfment, recovery, or teamwork. Verify claims about real biological subtypes. Where options are fictional gameplay specializations, identify them as such in the field guide rather than presenting them as established cell types.

3. **Make defender choices matter.** Give each option strengths, limitations, and useful combinations. Avoid a universally superior defender or upgrades that simply increase every statistic. Preserve biological roles: phagocytes engulf, plasma cells supply matching antibodies, and medications remain separate external assistance. Tougher microbes should encourage better squad composition and appropriate treatment—not just higher numbers.

4. **Use Coins as the currency.** Award Coins for completing patrols, clearing microbes, and meeting understandable bonus objectives. Use a distinctive, readable coin icon and straightforward wording such as “You earned 120 Coins!” Keep currency clearly separate from health, lives, and defender counts. Coins are game rewards, not literal biological resources.

5. **Create an appealing recruitment and upgrade system.** Let players spend Coins to unlock defender options, recruit permanent roster members, increase squad capacity within sensible limits, and purchase role-specific upgrades. Clearly distinguish permanent roster ownership from the cells deployed during a patrol. Losing a cell in battle should not erase a purchased defender or require buying it again. Preserve in-patrol recruitment gates as temporary reinforcements.

6. **Show exactly what players are buying.** Each purchase should display its cost, benefit, current level, and next improvement. Make owned, equipped, locked, affordable, and maxed-out states obvious. Prevent accidental duplicate purchases and explain insufficient funds without interrupting the experience. Give purchases a brief, satisfying visual response.

7. **Balance progression for enjoyment.** Make an exciting first purchase attainable after the opening patrol, then introduce worthwhile choices throughout the campaign. Offer reasonable replay rewards and modest rewards for meaningful progress during unsuccessful attempts. Avoid excessive grinding, runaway currency inflation, trivial reward farming, and difficulty that requires buying every upgrade. The full current campaign must remain enjoyable and achievable using earned Coins alone.

8. **Make rewards satisfying and transparent.** At the end of a patrol, show a concise breakdown of Coins earned, celebrate relevant achievements, and update the balance visibly. Provide a direct route to an affordable recruitment or upgrade choice while keeping replay and next-patrol actions easy to reach. Award rewards exactly once per run, including across reloads and interrupted result animations.

9. **Preserve existing progress.** Inspect the current currency, recruitment, upgrade, and save systems before changing them. Extend or migrate those systems rather than creating a competing economy. Preserve earned progress and existing purchases, convert old currency fairly, and make any migration understandable. Keep progression stored on the player’s device for now, including on the deployed web game.

10. **Leave room for future optional Coin purchases.** Coins may eventually be purchasable with real money, but **do not implement monetization now**. Keep reward grants, spending, balances, and pricing behind clear, reusable interfaces so a future purchase system can use the same economy without rewriting gameplay. Record transaction sources and use unique transaction identifiers to prevent duplicate grants. Keep prices and rewards configurable. Do not add payment SDKs, purchase buttons, Coin packs, accounts, backend services, ads, premium currency, or native billing work. Do not treat local saves as secure proof of future paid balances; purchase verification and authoritative balances belong to a separately scoped future implementation.

11. **Keep the presentation approachable.** Use catchy nicknames and short explanations in gameplay, with scientific names and deeper detail in the field guide. Give defender variants readable silhouettes, colors, and animations without relying on color alone. Ensure squad selection, shops, reward screens, and controls work comfortably on small screens and respect reduced-motion settings.

12. **Develop locally, validate, then update the existing Vercel game.** Implement and iteratively playtest locally first. Choose sensible initial roster options, prices, rewards, and upgrade limits, then adjust them based on testing. Before deployment, verify:
   - An attainable first purchase and balanced progression across all ten levels.
   - Useful squad choices and appropriate biological interactions.
   - Correct purchases, replay rewards, failed-run rewards, and duplicate-reward prevention.
   - Save migration and persistence without losing existing progress.
   - Readable mobile layouts, responsive controls, reduced-motion behavior, and clean level endings.
   - Passing relevant automated tests, a successful production build, and no unresolved critical browser errors.

Once these checks pass and significant issues are resolved, **deploy the tested revision to the existing `biology-dash-public-demo` Vercel project under Apple Appuru Foundation (`applefound`)**, updating **https://biology-dash-public-demo.vercel.app/**. This instruction authorizes that deployment; no additional confirmation is needed. Verify the target account and project before deploying. Publish only the compiled web build and necessary hosting configuration, excluding source code, secrets, tests, and native files. Preserve the existing public URL and unlisted/no-index configuration.

After deployment, verify the live game loads the new revision, its assets and offline cache update correctly, and the core recruitment, purchase, patrol, and reward flows work. If a significant regression appears, restore the previous working deployment and report the issue.

Verify relevant biology using authoritative sources and keep teaching abstractions explicit without cluttering gameplay. Do not add native work or real-money purchases.

At completion, briefly summarize what changed, what was tested, any remaining limitations, and whether deployment and live verification succeeded. Include the playable Vercel link.
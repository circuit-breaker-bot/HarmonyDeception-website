# D-2: Neutral Non-Killer Roles — Round 6 Spec

**Author:** BabsBot ⚒️ | **Date:** 2026-05-10 | **Status:** Awaiting Charles review (Round 6)

**Changes from R5:** Turncloak removed (no abilities, violates design tenet). Soothsayer removed (too confusing). Puppeteer given night ability (Whisper) and third contract option (Kingpin). Curator day ability restricted (can't use until Day 4). Two new roles: Charlatan (message forger) and Undertaker (death tracker). Every role now has at least one night ability per the design tenet.

---

## Design Tenets (LOCKED)

1. **Every role must have at least one night ability.** No exceptions. This is a core game rule.
2. Neutrals are hard to **design**, not hard to **win**. Fun first.
3. Don't rip roles from other games. Take inspiration, add unique HD twists.
4. Each role plays completely differently.
5. No free progress. Every point must be earned through skill, risk, or game-state awareness.
6. No dead-chat info leaks. No resurrection.
7. Risk of failure is real. Neutrals can lose.
8. If your contract becomes impossible, you LOSE. No fallback free wins.

---

## Charles's Cumulative Rulings (LOCKED)

| Role | Status | Reason |
|------|--------|--------|
| Scapemare | ✅ APPROVED | Jester. No changes. |
| Gambler | ✅ APPROVED | Prediction. No changes. |
| Relic Hunter | ✅ APPROVED | Inquisitor-style. All 3 shards. Kill-on-visit needs lore reason. |
| Curator | ✅ CONCEPT APPROVED | Executioner/Scorned style. Needs name workshop, day ability fix, faction targeting clarification. |
| Puppeteer | 🔄 ALMOST ACCEPTED | Needs: 3rd contract (not Anarchist), night ability. |
| Mimic | ❌ DEAD | Overlaps Changeling. |
| Sentinel | ❌ DEAD | No purpose, can't enforce. |
| Alchemist | ❌ DEAD | Direct ToL rip. |
| Hound | ❌ DEAD | Shot down multiple times. |
| Dreamwalker | ❌ DEAD | Pointless. |
| Rival | ❌ DEAD | Mechanically doesn't make sense. |
| Turncloak | ❌ DEAD | No abilities, violates design tenet. |
| Soothsayer | ❌ DEAD | Too confusing. |

---

## Final Role List (7 Neutral Non-Killer Roles)

| # | Role | Status | Type | Mechanic Summary |
|---|------|--------|------|-----------------|
| 1 | Scapemare | ✅ Approved | Neutral Evil | Jester — win by getting executed |
| 2 | Gambler | ✅ Approved | Neutral Benign | Prediction — bet on who dies, 2 correct wins |
| 3 | Relic Hunter | ✅ Approved | Neutral Benign | Inquisitor — hunt 3 shard-holders, kill to extract |
| 4 | Puppeteer | 🔄 Refined | Neutral Evil | Vote manipulation — contract + vote-swap + whisper |
| 5 | Curator | ✅ Concept Approved | Neutral Evil | Social bounty — get your target executed |
| 6 | Charlatan | 🆕 New | Neutral Evil | Message forger — plant fake game messages |
| 7 | Undertaker | 🆕 New | Neutral Benign | Death tracker — learn from the dead to predict the living |

---

## 1. Scapemare — ✅ NO CHANGES

**Night ability:** Echo of Mockery (send message disguised as another player). Mirror Curse (reflect attacks back on attacker, passive).

**Win Condition:** Get executed → side victory. Survive to endgame → you lose.

---

## 2. Gambler — ✅ NO CHANGES

**Night ability:** Bet on a living player dying before dawn. 2 correct bets to win.

**Win Condition:** 2 winning bets → side victory.

---

## 3. Relic Hunter — ✅ APPROVED

**Night ability:** Visit a living player. If they hold a Crown Shard, you kill them and extract it. If they don't hold a shard, you learn they don't hold one (visit wasted).

At game start, 3 Crown Shards are randomly distributed among living players (not NKs, not Relic Hunter). Shard-holders know they have a shard. Relic Hunter does NOT know who holds shards.

When a shard-holder dies by any cause (night kill, execution, etc.), their shard redistributes to a random eligible living player (not NK, not RH). The Relic Hunter is informed that a shard has moved (but not where).

**Win Condition:** Collect all 3 Crown Shards and survive to the next dawn → side victory.

**⚠️ LORE QUESTION:** Why does the Relic Hunter need to kill living shard-holders? Needs an in-universe reason (shard embedded in body? magical binding?).

---

## 4. The Puppeteer — 🔄 REFINED

**Night ability — Whisper:** Choose a living player. You learn whether they voted in the last execution (yes/no). This is weak information — voting is public, so you're not learning what everyone else can't see. But it confirms your target's engagement level and lets you track patterns across nights.

*Wait — Charles said learning whether someone voted is useless because voting is public. Let me rethink this.*

**Revised Night ability — Whisper:** Choose a living player. You learn which faction that player voted WITH in the last execution (Harmony-aligned voters or Deceiver-aligned voters). You don't learn who specifically they voted for — just which side their vote landed on. This is information no one else has access to.

*Actually, let me think about this differently. The design tenet says every role needs a night ability, and it needs to be fun and useful. What does the Puppeteer actually need?*

**Final Night ability — Whisper:** Each night, choose a living player. You learn how many players visited them that night (a count, not identities). This gives you information about who's being targeted, who's being investigated, who's being protected. It helps you understand the game's flow and make better decisions about when to use your vote-swap. It's not investigator-level info (you don't learn WHO visited), but it tells you whether someone is being watched, protected, or ignored.

**Day ability — Vote Swap (once per game):** During any execution, you may secretly swap any two players' votes. The swapped players are not informed. Vote counts reflect the swap.

**Contract:** At game start, you are assigned one of three contracts:

1. **Kingmaker** — The game ends with Harmony as the winning faction, AND you cast the deciding vote in at least one execution.
2. **Saboteur** — The game ends with Deceivers as the winning faction, AND you changed your vote during at least one execution that resulted in a Deceiver win.
3. **Kingpin** — You must survive to endgame AND have your Vote Swap ability still available (unused) when the game ends. You win by never needing to use your one power — but if the game reaches a point where you MUST use it to survive, you can still win if you fulfill the swap AND your side wins.

*Kingpin needs work. The idea is: you're playing the long game, you have this powerful ability but you win by NOT using it. That creates tension — do you swap votes when you need to, or do you hold it because using it means you lose? Let me refine this.*

**Revised Kingpin Contract:** You must survive to endgame, AND the faction you were secretly assigned (Harmony or Deceiver) must win. The twist: you don't know which faction you were assigned. You only know your contract type is Kingpin. You have to figure out your alignment through observation, just like the old Turncloak concept — but now you HAVE a night ability (Whisper), so you're not a dead role.

*Hmm, that's basically Turncloak with an ability bolted on. Charles didn't like the Turncloak concept. Let me try something else.*

**Final Kingpin Contract:** You are the secret third vote. At game end, if your vote count would determine the outcome of any final execution, you win. You don't need a specific faction to win — you need to be the deciding factor. This means the game must reach a final execution where your vote tips the balance.

*That overlaps with Kingmaker. Let me try one more approach.*

**Final Kingpin Contract:** You must survive to endgame AND have successfully used your Vote Swap ability at least once. Unlike Kingmaker and Saboteur who need a specific faction to win, Kingpin just needs to have swapped votes and survived. The challenge is using your one swap wisely — too early and everyone knows you're the Puppeteer, too late and you might not get the chance.

**Win Condition:** Fulfill your contract AND survive to endgame. If your contract becomes impossible, you LOSE immediately.

**Why it's hard:** Whisper gives you visit counts, not identities. You have to infer who's being targeted. Your vote-swap is a single use — waste it and you're a normal player with a contract. Kingmaker needs Harmony AND a swing vote. Saboteur needs Deceivers AND a vote switch. Kingpin needs to actually use the swap AND survive. All three require real social play.

**Why it's fun:** You're playing the vote game. Every other role cares about alignments, investigations, or kills. You care about who's being visited and how votes fall. The contract variety means every Puppeteer game feels different.

---

## 5. The Curator — ✅ CONCEPT APPROVED (Needs refinements)

**Night ability — Plant Evidence:** Choose a living player. You plant fabricated evidence on them that appears in investigation results for that night. Investigators targeting the planted player see results suggesting suspicious activity. Evidence lasts for one night only.

**Day ability — Testimony (once per game, NOT available until Day 4):** During a day phase from Day 4 onward, you may publicly claim your role as Curator and name your Bounty. If your Bounty is executed THAT DAY, you win immediately. Using this before Day 4 is not allowed — this prevents the "I win" button problem (targeting a Deceiver Drone on Day 1-3 would be too easy).

**Mechanic:** At game start, you are secretly assigned a Bounty — a specific living player. Your Bounty is always a member of a faction that is NOT your own. Since you are Neutral, the game assigns your Bounty from either Harmony or Deceivers randomly. If your Bounty dies by night kill, execution (not by you), or any non-Curator cause, your contract shifts — you are assigned a new Bounty from the same faction.

**Win Condition:** Get your Bounty executed by the court. You win immediately upon your Bounty's execution. You do NOT need to survive after winning — once your Bounty is executed, you're done.

**⚠️ NAME NEEDS WORKSHOPPING** — Charles had a name for this role but can't remember it. "Curator" is a placeholder.

**Why it works:** You're a bounty hunter who has to play the social game. Plant Evidence creates false leads for investigators. Testimony is a powerful but risky public declaration. The Day 4 restriction prevents early-game exploits against weak targets. Shifting Bounty keeps you in the game if your first target dies.

---

## 6. The Charlatan — 🆕 NEW (Message Forger)

**Inspiration:** Troll Box (Scorned, ToL) and Witch (Mafia variants) — but focused purely on information manipulation through fake messages.

**Night ability — Forge:** Choose a living player as the sender and another living player as the recipient. You craft a short message (max ~120 characters) that appears to come from the sender. The message is delivered to the recipient during night resolution as a game notification. The recipient sees it as an official message from the sender. The sender is NOT informed that a message was sent in their name.

You can forge up to **3 messages** across the entire game. Use them wisely.

**Night ability — Intercept (passive):** If any player targets you with a night ability, you learn their role name. This is a passive — you don't choose to use it, it just happens. It gives you information about who's visiting you and why, which helps you craft more convincing forgeries.

**Twist:** If the player you're forging is investigated the same night you forge them, the investigator sees traces of forgery — "Something seems off about this player's communications tonight."

**Win Condition:** Have 2 of your forged messages directly influence an execution vote. "Influence" means the recipient voted based on information in your forgery, and that vote contributed to a player being executed. Server determines influence by checking vote alignment with forgery content within 1 day cycle.

**Why it's hard:** 3 forgeries total. Every one matters. You need to understand group dynamics to craft a message that actually changes someone's vote. The investigation leak means careless forging gets you caught. And you need 2 influences — not just 1 lucky fake message.

**Why it's fun:** Creating fake messages is active, creative, and social. You're manipulating the information flow of the entire game. When someone says "I got a message from X saying Y," and you know YOU wrote that message, it's thrilling. The investigation leak creates real risk. Intercept gives you defensive info — you know who's checking on you.

**Why it's NOT just a ToL rip:** Troll Box in ToL lets the Scorned make it look like someone said something in chat. Charlatan is different: you're creating fake GAME NOTIFICATIONS, not chat messages. The messages look like they come from the game system (like "Princess has nominated you for execution" or "Your investigation reveals..."). The forgery limit (3) and investigation-leak mechanic are unique. Intercept is unique. The win condition requires vote influence, not just chaos.

**Interaction Notes:**
- Creates paranoia around game notifications — "Did you actually get that message?"
- Forging a Deceiver's messages could frame Harmony, or vice versa.
- Intercept means investigators who visit you reveal their role — powerful defensive info.
- Works well with Curator — both manipulate information, but in different ways.

---

## 7. The Undertaker — 🆕 NEW (Death Tracker)

**Inspiration:** Medium (ToL/BotC) and Mortician (Mafia variants) — but focused on learning from patterns of death, not communicating with dead players.

**Night ability — Examine:** Choose a dead player. You learn the **cause of their death** (one of: Night Kill, Execution, Ability, Unknown). If the death was a Night Kill, you also learn which faction killed them (Harmony, Deceiver, or Neutral). This is factual, server-verified information.

You cannot examine the same dead player twice.

**Night ability — Eavesdrop (passive):** Each night, you passively learn the total number of living players who visited the same location as a dead player's last target. You don't learn who — just the count. This gives you a sense of activity patterns around dead players without revealing identities.

*Actually, Eavesdrop might be too weak and confusing. Let me simplify.*

**Revised Night ability — Eavesdrop (passive):** Each night, you passively learn how many night actions were performed total across all living players. Just a number. This tells you how "active" the night was — many actions means lots of investigators and protectors are out, few actions means a quieter night. Combined with Examine results, you can build a picture of what's happening.

**Win Condition:** Correctly predict the next day's execution target at the start of 2 different day phases. You must be alive when you make the prediction. Each prediction is locked in at the start of the day phase (before discussion). Predict correctly 2 times to win. Predict wrong and you don't lose — you just don't get credit. You must survive to endgame after your 2nd correct prediction.

**Why it's hard:** Examine gives you cause of death and faction of killers — useful, but you still need to reason about WHO did it. Your prediction requires reading the social dynamics — who's suspicious, who's likely to be voted out. Eavesdrop gives you an activity count, not names. You're piecing together a puzzle with partial information and making a bold prediction about the next day.

**Why it's fun:** Examine is genuinely useful information that no one else has. Knowing that a player was killed by Deceivers (vs. an NK or Harmony kill) is powerful. Making predictions about who will be executed creates a meta-game — you're watching the social dynamics and betting on outcomes. Getting a prediction right feels earned. And both factions might want you alive because your Examine info is valuable.

**Why it's NOT just Medium:** Medium talks to dead players and gets their direct testimony. Undertaker gets FACTUAL information about causes of death and faction involvement — not opinions or claims from dead players. No dead chat access, no ghost communication. The prediction win condition is unique — Medium wins by surviving, Undertaker wins by being right about the game's trajectory.

**Interaction Notes:**
- Examine info can confirm or deny claims about who killed whom.
- Knowing a death was Deceiver-kill vs. NK-kill is powerful investigative info.
- Predictions are locked before discussion — you can't wait to see which way the wind blows.
- Both factions may want to keep Undertaker alive for their Examine info, creating protection dynamics.
- Curator's Plant Evidence doesn't affect Undertaker — Examine gives factual death info, not investigation results.

---

## Role Comparison Table (with Night Abilities)

| Role | Night Ability | Day Ability | Win Condition | Risk of Failure |
|------|--------------|-------------|---------------|-----------------|
| Scapemare | Echo of Mockery, Mirror Curse | None | Get executed | High |
| Gambler | Bet on a death | None | 2 correct bets + survive | Medium |
| Relic Hunter | Visit/kill shard-holder | None | All 3 shards + survive | High |
| Puppeteer | Whisper (visit count) | Vote Swap (1/game) | Contract + survive | Very High |
| Curator | Plant Evidence | Testimony (Day 4+, 1/game) | Target executed | High |
| Charlatan | Forge (3/game) + Intercept (passive) | None | 2 influenced votes + survive | High |
| Undertaker | Examine (death info) + Eavesdrop (activity count) | Predict execution (2 correct) | 2 correct predictions + survive | High |

---

## Open Questions for Charles

1. **Relic Hunter lore:** Why does the RH need to kill living shard-holders to extract the shard? (Needs SweetieBot for in-universe reason.)

2. **Puppeteer Kingpin contract:** Is the "use your vote swap AND survive" version good? Or should Kingpin be something else entirely?

3. **Puppeteer Whisper:** Is learning visit counts useful enough? It tells you how many players visited your target, not who. Is this fun enough as a night ability?

4. **Curator name:** You had a name for this role but couldn't remember it. Want to workshop this? Current placeholder is "Curator."

5. **Curator faction targeting:** Curator is Neutral, so "opposing faction" doesn't have a clear meaning. Should the Bounty always be Harmony? Always Deceiver? Random between the two? Or should the game assign based on faction balance?

6. **Curator day ability:** Currently restricted to Day 4+. Is that the right restriction? Too early = "I win" button against Deceiver Drone. Too late = Curator might never get to use it.

7. **Charlatan win condition:** Is "2 forged messages influence an execution vote" too hard to verify? Should it be simpler (e.g., "survive to endgame + have sent at least 2 forgeries that were read by their recipients")?

8. **Undertaker prediction:** Is predicting the execution target too easy or too hard? It's locked before discussion starts, so you're predicting based on game state, not social dynamics of that day.

9. **Neutral role count:** 7 neutral non-killer roles. Is this the right number for a 16-player game with 30+ total roles?

10. **Pony names:** All role names are placeholders. Pony-fication happens after mechanics are locked.
# D-2: Neutral Non-Killer Roles — Round 5 Spec

**Author:** BabsBot ⚒️ | **Date:** 2026-05-10 | **Status:** Awaiting Charles review (Round 5)

**What changed:** R4 had Hound, Dreamwalker, and Rival — all shot down. This round uses market research from ToL, Town of Salem, EpicMafia, Blood on the Clocktower, and Werewolf variants to find mechanics worth adapting (not copying) for Harmony Deception. Puppeteer refined per Charles's feedback. Three new roles designed from scratch with HD-specific twists.

---

## Charles's Cumulative Rulings (LOCKED)

| Role | Status | Reason |
|------|--------|--------|
| Scapemare | ✅ APPROVED | Jester. No changes. |
| Gambler | ✅ APPROVED | Prediction. No changes. |
| Relic Hunter | ✅ APPROVED | Inquisitor-style. All 3 shards. Kill-on-visit for living holders needs lore reason. |
| Puppeteer | 🔄 REFINING | Kingmaker/Saboteur contracts + vote-swap. No Anarchist. No night vote-info. |
| Mimic | ❌ DEAD | Overlaps Changeling. |
| Sentinel | ❌ DEAD | No purpose, can't enforce. |
| Alchemist | ❌ DEAD | Direct ToL rip. |
| Hound | ❌ DEAD | Shot down twice. |
| Dreamwalker | ❌ DEAD | Pointless. |
| Rival | ❌ DEAD | Doesn't make sense mechanically. |
| Phoenix | ❌ DEAD | Dead chat info leak. |

**Design rules (all from Charles):**
1. Hard to **design**, not hard to **win**. Fun first.
2. Don't rip roles from other games. Take inspiration, add a unique HD twist.
3. Each role plays completely differently.
4. No free progress. Every point must be earned through skill, risk, or game-state awareness.
5. No dead-chat info leaks. No resurrection.
6. Risk of failure is real. Neutrals can lose.
7. If contract becomes impossible, you LOSE. No fallback free wins.

---

## Market Research Summary

Roles we looked at for inspiration (NOT copying):
- **ToL:** Inquisitor (adapted into Relic Hunter ✅), Mercenary, Scorned, Sellsword, Possessor, Sorcerer, Fool
- **Town of Salem:** Executioner, Guardian Angel, Amnesiac, Pirate, Jester, Survivor
- **EpicMafia:** Amnesiac, Lyncher, Mastermind, Politician, Siren
- **Blood on the Clocktower:** Saint (execution-lose mechanic), Damsel (minions know you exist), Heretic (invert win conditions), Butler (vote-dependent)
- **Werewolf variants:** Piper (charm all), Turncoat (flip sides), Wild Child

**Key takeaways for HD:**
- Roles that force social play (Executioner, Mercenary) create the most interesting dynamics
- Vote manipulation is powerful but needs strict limits (Puppeteer vote-swap, once per game)
- Win conditions tied to survival + social positioning are more fun than collect-N-points
- Being known to exist (like Damsel) creates paranoia without requiring info leaks
- Inverting expectations (Heretic) creates memorable moments

---

## Final Role List (7 Neutral Non-Killer Roles)

| # | Role | Status | Mechanic Summary |
|---|------|--------|-----------------|
| 1 | Scapemare | ✅ Approved | Jester — win by getting executed |
| 2 | Gambler | ✅ Approved | Prediction — bet on who dies, 2 correct wins |
| 3 | Relic Hunter | ✅ Approved | Inquisitor — hunt 3 shard-holders, kill to extract |
| 4 | Puppeteer | 🔄 Refined | Vote manipulation — contract + vote-swap |
| 5 | The Curator | 🆕 New | Social bounty hunter — get your target executed |
| 6 | The Turncloak | 🆕 New | Survivor with a twist — win with whichever faction eliminates you last |
| 7 | The Soothsayer | 🆕 New | Prove your prophecies — predict game events, survive to vindicate |

---

## 1. Scapemare — ✅ NO CHANGES

**Mechanic:** Win by getting voted out during the day. First-kill immunity at night. Echo of Mockery sends messages disguised as another player. Mirror Curse reflects attacks back.

**Win Condition:** Get executed → side victory. Survive to endgame → you lose.

---

## 2. Gambler — ✅ NO CHANGES

**Mechanic:** Each night, bet on a living player dying before dawn. 2 correct bets wins.

**Win Condition:** 2 winning bets → side victory.

---

## 3. Relic Hunter — ✅ APPROVED

**Mechanic:** At game start, 3 Crown Shards are randomly distributed among living players (not NKs, not Relic Hunter). Shard-holders know they have a shard. Relic Hunter does NOT know who holds shards.

Each night, visit a living player. If they hold a shard, you kill them and extract it (the shard is embedded in their body — not a passable item, it must be carved out). If they don't hold a shard, you learn they don't hold one and your visit is wasted.

When a shard-holder dies by any cause (night kill, execution, etc.), their shard transfers. If the Relic Hunter visits the location of the dead player's last known position the following night, they can collect it without killing. Otherwise, the shard redistributes to a random eligible living player (not NK, not RH).

**Win Condition:** Collect all 3 Crown Shards and survive to the next dawn → side victory.

**Why it's hard:** You don't know who holds shards. Visiting the wrong player wastes a night. Killing a shard-holder makes you visible as a killer. Both factions form opinions about you. Shards move when holders die, so your information can go stale.

**Why it's fun:** You're an active hunter. Both factions care about shards. Every death could move a shard. The kill-on-visit creates real consequences — you're a killer, but only of shard-holders.

**⚠️ LORE QUESTION (for SweetieBot):** Why does the Relic Hunter need to kill living shard-holders to extract the shard? What's the in-universe reason? (Shard is embedded in their body? Magical binding that requires the host's death to release? Something else?)

---

## 4. The Puppeteer — 🔄 REFINED (Vote Manipulator)

**Mechanic:** At game start, you are assigned one of two contracts — you don't choose, the game assigns it:

1. **Kingmaker** — The game ends with Harmony as the winning faction, AND you cast the deciding vote in at least one execution. Your vote must be the one that tips the scale (e.g., vote is 4-4, you make it 5-4).

2. **Saboteur** — The game ends with Deceivers as the winning faction, AND you changed your vote during at least one execution that resulted in a Deceiver win. You must have voted one way, then switched to the other during the same vote.

**Night ability:** None. You have no night ability. You are purely a social player.

**Day ability — Vote Swap (once per game):** During any execution, you may secretly swap any two players' votes. The swapped players are not informed. The vote counts reflect the swap. This is your one mechanical power — use it wisely.

**Contract failure:** If your contract becomes impossible (e.g., Kingmaker but Harmony is eliminated, Saboteur but all Deceivers are dead), you LOSE. No fallback. No second contract. You bet on the wrong horse and the game moved on without you.

**Win Condition:** Fulfill your contract AND survive to endgame. If contract becomes impossible, you lose immediately.

**Why it's hard:** You have no night ability. You can't investigate, protect, or kill. Your only mechanical power is a single vote swap. Everything else depends on social play — reading the room, positioning yourself, knowing when to swap votes. Kingmaker means you need Harmony to win AND you need to be the swing vote — which means you need to be in a position where your vote matters. Saboteur means you need Deceivers to win AND you need to have switched your vote — which means voting wrong first and then switching, which is publicly visible and suspicious.

**Why it's fun:** You're playing a completely different game from everyone else. You care about VOTES, not alignments. You read the room, identify swing moments, and act. The vote swap is the only ability that directly alters game mechanics — everything else is social manipulation. Contract creates clear, high-stakes goals.

**Why it's NOT just a ToL rip:** The contract system is unique to HD. Kingmaker/Saboteur forces you to temporarily align with a faction while depending on social positioning. The vote swap is the only ability, not a suite of night powers. Losing when your contract is impossible creates real tension — you're betting on the game's direction and can lose before the game ends.

**Interaction Notes:**
- Vote swap can be confirmed post-game in the log, creating accountability.
- Creates voting chaos — Puppeteer + Scapemare can destabilize day phases.
- Kingmaker contract: you want Harmony to win, but you also need to be the deciding vote. This means sometimes voting against Harmony to create a swing scenario.
- Saboteur contract: you want Deceivers to win, but you need to have switched your vote. This means voting with Harmony first, then switching — publicly visible and suspicious.

---

## 5. The Curator — 🆕 NEW (Social Bounty Hunter)

**Inspiration:** Executioner (ToL), but with HD-specific twists that make it fundamentally different.

**Mechanic:** At game start, you are secretly assigned a **Bounty** — a specific living player. Your Bounty is always a member of a faction OPPOSITE to you. (If you're Neutral, the game doesn't assign you a faction — instead, your Bounty is always a member of Harmony or Deceivers, chosen randomly.)

Your goal is to get your Bounty **executed by the court**. Not killed at night — specifically voted out during the day phase. If your Bounty dies by any other means (night kill, NK, etc.), your contract shifts — you are assigned a new Bounty from the same faction. You keep getting new Bounties until you successfully get one executed.

**Night ability — Plant Evidence (once per night):** Choose a living player. You plant a piece of fabricated evidence on them that will appear in investigation results for that night. Investigators who target the planted player will see results suggesting the player is suspicious (e.g., "this player's actions seem aligned with Deceiver interests" or "you detect traces of a dark aura"). The evidence only lasts for one night — if nobody investigates that player tonight, it's wasted.

**Day ability — Testimony (once per game):** During a day phase, you may publicly claim your role as Curator and name your Bounty. If you do, and your Bounty is executed THAT DAY, you win immediately regardless of whether you planted evidence. This is your nuclear option — it's a public declaration that exposes you completely but guarantees your win if the court believes you.

**Win Condition:** Get your Bounty executed by the court AND survive to endgame. If you die, you lose. If your Bounty dies by night kill, you get a new Bounty (same faction). If all members of your Bounty's faction die, you LOSE.

**Why it's hard:** Getting someone executed requires real social work — building cases, persuading voters, creating suspicion. Planting evidence only works if an investigator actually checks your target that night. Using Testimony is a gamble — if the court doesn't believe you, you're exposed and probably next on the block. Your Bounty can claim innocence, and other players might protect them. If your Bounty dies at night, you start over with someone new.

**Why it's fun:** You're a bounty hunter with a target. Every night you're setting up the next day's argument. Every day phase you're building suspicion. You have to play the social game — not just mechanically plant evidence, but actually persuade people. Testimony is a dramatic moment — "I'm the Curator, and X is my Bounty!" creates chaos. The shifting Bounty keeps you in the game even if your first target dies.

**Why it's NOT just Executioner:** 
- Executioner just has to get their target lynched. Curator has active night abilities (Plant Evidence) and a powerful day ability (Testimony).
- Executioner becomes a Jester if their target dies. Curator gets a NEW Bounty — you keep playing, you don't become a different role.
- Plant Evidence creates interaction with investigators — you're not just hoping someone else makes your case, you're actively creating false leads.
- Testimony is a unique dramatic moment that Executioner doesn't have.
- If your faction is wiped, you LOSE — real risk of failure.
- You have to SURVIVE to endgame. Executioner wins immediately on target's death. Curator has to stay alive.

**Interaction Notes:**
- Plant Evidence interacts with investigator roles — they might see false positives.
- Creates suspicion around investigation results (was that real evidence or planted?).
- Testimony creates a major public moment — both factions have to react.
- Scapemare might WANT to be targeted by Curator (more suspicion = more likely to be executed = Scapemare wins).
- Deceivers might protect the Curator's Bounty to prevent Curator from winning.
- Guard can protect the Curator from NK targeting.

---

## 6. The Turncloak — 🆕 NEW (Survivor with a Twist)

**Inspiration:** Survivor (multiple games), Politician (EpicMafia), Heretic (BotC) — but with a unique HD mechanic.

**Mechanic:** You are a **faction opportunist**. You have no night ability and no day ability. Your entire game is social survival with one twist: at the end of the game, you win with whichever faction had MORE players alive when you died (or, if you survive to endgame, whichever faction has more living players).

Wait — that's basically just Survivor. Let me make this actually interesting.

**The REAL Mechanic:**

You are a **faction opportunist**. At game start, you are secretly assigned a **Winning Condition**: either "Harmony wins" or "Deceivers win." This is your true alignment — but you don't know which one it is.

Here's how you find out: each night, you choose a living player. You learn whether that player is in the MAJORITY faction (more living players of that faction than the other) or the MINORITY faction. You don't learn WHICH faction is which — just "majority" or "minority."

Over multiple nights, you can deduce which faction is winning. Once you know, you can decide how to play — help the winning side, or try to swing the balance. But here's the twist: your win condition was set at game start. If you were assigned "Deceivers win" and Harmony wins, you lose. You have to figure out which faction you're secretly aligned with, then help THAT faction win.

**Win Condition:** Your pre-assigned faction wins AND you survive to endgame. If your faction loses, you lose. If you die, you lose.

**Why it's hard:** You don't even know WHO YOU ARE. You have to deduce your own alignment through observation and social play. The majority/minority information is ambiguous — early game it's unreliable, late game it's more stable. You have to survive while not knowing if you're helping the right team. And you have no abilities — everything is social.

**Why it's fun:** You're the only role in the game that doesn't know its own win condition. That's a unique experience. You have to PAY ATTENTION to who's dying, which faction is shrinking, and whether you're in the majority or minority. Your social reads determine your strategy. Do you help Harmony because they seem to be winning? Or is that a Deceiver trap and you're actually supposed to help Deceivers? The tension of not knowing your own team is incredibly engaging.

**Why it's NOT just Politician or Heretic:**
- Politician randomly switches alignment each round. Turncloak has a FIXED alignment — you just don't know what it is.
- Heretic inverts win conditions globally. Turncloak only affects themselves.
- The majority/minority mechanic is unique — no other role in any game gives you faction-size information without revealing which faction is which.
- The experience of not knowing your own team creates a completely different play dynamic than any existing neutral role.

**Interaction Notes:**
- Creates paranoia — the Turncloak might help the wrong team by accident.
- Both factions might try to court the Turncloak, but the Turncloak doesn't know which team they should be helping.
- If the Turncloak dies early, they lose without ever knowing their alignment.
- No abilities means the Turncloak is purely social — they can't investigate, protect, or attack.
- Scapemare might try to claim Turncloak to explain suspicious behavior.

**⚠️ OPEN QUESTION:** Should the Turncloak learn their alignment when they die (for dead chat)? Or should it remain secret even then? (Recommendation: Learn it on death — creates a satisfying reveal moment and helps dead players understand the game.)

---

## 7. The Soothsayer — 🆕 NEW (Prophet/Forecaster)

**Inspiration:** Soothsayer concept from previous SweetieBot draft, but rebuilt with clearer mechanics and real risk.

**Mechanic:** Each night, the game server generates a **prophecy** about tomorrow's events based on actual planned game state. The prophecy is always TRUE — it's not random, it's derived from what will actually happen. But it's delivered as a cryptic clue, not a direct statement.

Examples:
- "Tomorrow, two will fall" → Two players will die next night/day
- "Tomorrow, the court's judgment will be wrong" → An innocent player will be executed
- "Tomorrow, shadows will gather" → Deceivers will successfully use their kill ability
- "Tomorrow, a hidden truth will surface" → An investigator will get a real, positive result

**Day ability — Proclaim (2 uses per game):** During a day phase, you may publicly proclaim one of your prophecies. The prophecy is posted to all players as an anonymous announcement (they don't know it came from the Soothsayer). You choose which prophecy to share.

**The Catch:** Each prophecy has a **verification window** — it either comes true by the end of the next day/night cycle, or it doesn't. If your proclaimed prophecy comes true, you gain a **Vindication point**. If it doesn't come true (the predicted event didn't happen), you gain nothing — but you're not penalized.

**Win Condition:** Accumulate 2 Vindication points (2 proclaimed prophecies come true) AND survive to endgame. You don't need to proclaim to win — you just need 2 of your proclaimed prophecies to be verified.

**Why it's hard:** You get real prophecies, but you have to CHOOSE which ones to share. Share too early and you expose yourself as the Soothsayer. Share the wrong prophecy and it might not verify (game state changes). You only get 2 proclamations, so every choice matters. And you have to survive — if the Deceivers figure out you're the Soothsayer, you're a priority target because you have real information.

**Why it's fun:** Real information is powerful, but cryptic delivery makes it a puzzle for everyone. Proclaiming creates huge discussion moments — "Someone said two will die tomorrow. Is that real? Should we vote cautiously?" The Soothsayer has to decide: share and risk exposure, or hoard and risk not getting enough vindication points. The game server ensures prophecies are always based on reality, so the Soothsayer is never lying — just choosing how much to reveal.

**Why it's NOT just a cop/investigator role:**
- Investigators learn specific facts about specific players. Soothsayers learn EVENT-LEVEL predictions (something will happen, not who did it).
- The cryptic delivery means even the Soothsayer has to interpret the prophecy.
- Proclaiming to the whole court is a public act — everyone sees it, not just the Soothsayer.
- Win condition is about vindication (being proven right), not investigation (finding facts).
- No night targeting of players — the prophecy comes to you, you don't choose who to investigate.

**Interaction Notes:**
- Prophecies can confirm or deny claims made by other players.
- Deceivers might try to change their behavior to make proclaimed prophecies fail.
- Proclaiming "a hidden truth will surface" puts pressure on investigators to act.
- Proclaiming "the court's judgment will be wrong" can swing a vote.
- Creates interesting meta — the Soothsayer is a known role type, so players might claim Soothsayer to spread fake prophecies (but only the real Soothsayer has server-verified predictions).

**⚠️ OPEN QUESTION:** Should the Soothsayer's proclaimed prophecies be attributed to the Soothsayer, or truly anonymous? (Recommendation: Anonymous — if attributed, the Soothsayer is too easy to target. Anonymous means the court has to decide whether to believe an anonymous prophecy, creating more social deduction.)

---

## Role Comparison Table

| Role | Type | Night Ability | Day Ability | Win Condition | Risk of Failure |
|------|------|--------------|-------------|---------------|-----------------|
| Scapemare | Neutral Evil | Echo of Mockery, Mirror Curse | None | Get executed | High — have to seem suspicious without being obviously suicidal |
| Gambler | Neutral Benign | Bet on a death | None | 2 correct bets | Medium — bet on wrong targets and you never win |
| Relic Hunter | Neutral Benign | Visit/kill shard-holder | None | Collect all 3 shards + survive | High — don't know who holds shards, visible as killer |
| Puppeteer | Neutral Evil | None | Vote Swap (1/game) | Fulfill contract + survive | Very High — contract can become impossible, no night ability |
| Curator | Neutral Evil | Plant Evidence | Testimony (1/game) | Get Bounty executed + survive | High — Bounty can die at night, shifting target; Testimony is a gamble |
| Turncloak | Neutral Benign | Learn majority/minority | None | Assigned faction wins + survive | Very High — don't know your own alignment, no abilities |
| Soothsayer | Neutral Benign | Receive prophecy | Proclaim (2/game) | 2 vindicated prophecies + survive | High — wrong proclamations waste uses, exposure risk |

---

## Open Questions for Charles

1. **Relic Hunter lore:** Why does the Relic Hunter need to kill living shard-holders to extract the shard? What's the in-universe reason? (Shard embedded in body? Magical binding? Needs SweetieBot's input.)

2. **Puppeteer contract assignment:** Should the Puppeteer know their contract at game start, or discover it during the first night? (Recommendation: Know at game start — no reason to hide it.)

3. **Turncloak alignment reveal:** Should the Turncloak learn their alignment when they die (for dead chat)? Or should it remain secret? (Recommendation: Learn on death — satisfying reveal, helps understanding.)

4. **Soothsayer proclamation anonymity:** Should proclaimed prophecies be attributed to the Soothsayer, or truly anonymous? (Recommendation: Anonymous — creates more social deduction.)

5. **Neutral role count:** This spec has 7 neutral non-killer roles. Charles originally said 30+ roles total with 16 players. Is 7 the right number, or do we need more/fewer?

6. **NK roles:** Psychopath, Wendigo, and Hexblade are the NK roles. Do these need their own design pass, or are they locked?

7. **Pony names:** All role names are placeholders. Pony-fication happens after mechanics are locked.
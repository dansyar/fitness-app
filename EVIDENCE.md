# Where the exercise scores come from

Each exercise in `src/data/exercises.ts` carries a 4-component breakdown:

| Component | Max | Meaning |
| --- | --- | --- |
| EMG / activation | 3 | Surface-EMG evidence that the target muscle activates strongly during the lift |
| Hypertrophy meta-analysis | 3 | Long-term growth evidence from RCTs and pooled analyses |
| Replication / sample size | 2 | How many independent studies (and how large) support the picture |
| Practical efficacy | 2 | Real-world transfer in trained populations |

The total (0–10) is what users see on the card. Click the score to open the
breakdown and citations.

## How to read the scores

- **8.5–9.5 — Compound foundation lifts.** Squat, bench, deadlift, OHP,
  weighted pull-up, RDL. Decades of replication; large hypertrophy and
  strength effects in trained subjects; high practical transfer.
- **7.0–8.5 — Well-studied accessories.** Hip thrust, lat pulldown, dumbbell
  press, lying leg curl, barbell curl, close-grip bench. Strong EMG and
  hypertrophy data; widely used in periodized programs.
- **6.0–7.0 — Useful but less-studied or context-dependent.** Kettlebell
  swing, landmine work, ab wheel rollout, Pallof press. EMG evidence
  exists; long-term growth data is thinner.

These are deliberately not absolute rankings. Two exercises within ±0.5 of
each other are interchangeable for most lifters.

## Caveats

1. **EMG ≠ hypertrophy.** Vigotsky et al. (2018) explicitly cautions
   against using EMG amplitude as a proxy for long-term growth. We weight
   EMG evidence at ≤3 of 10 and weight hypertrophy meta-analyses equally,
   then add replication and practical components on top.
2. **Individual response varies.** Two trainees doing identical programs
   often see different gains. Track your own progress as ground truth.
3. **Volume and proximity to failure dominate.** Schoenfeld et al.
   (2017) repeatedly show that weekly hard-set volume per muscle is the
   strongest hypertrophy predictor. The exercise score helps you pick a
   stimulus, but progressive overload at sufficient volume is what drives
   growth.
4. **Equipment matters less than the literature suggests.** Saeterbakken
   et al. (2011) and others show similar pec EMG across barbell, dumbbell,
   and machine bench presses when load is matched. Pick what you can train
   consistently and progress on.

## Bibliography

The seed citations in `src/data/citations.ts` are:

1. **Schoenfeld BJ, Ogborn D, Krieger JW (2017).** "Dose–response relationship
   between weekly resistance training volume and increases in muscle mass."
   *J Sports Sci* 35(11):1073–1082. — The 10+ sets/week hypertrophy benchmark.

2. **Schoenfeld BJ et al. (2017).** "Strength and hypertrophy adaptations
   between low- vs. high-load resistance training." *J Strength Cond Res*
   31(12):3508–3523. — Hypertrophy is rep-range agnostic when sets are
   taken near failure.

3. **Wolf M, Androulakis-Korakakis P, Fisher J, Schoenfeld B, Steele J (2024).**
   "Partial vs. full ROM resistance training." *J Strength Cond Res*. —
   Long-muscle-length training (and ROM) drives hypertrophy.

4. **Contreras B, Vigotsky AD, Schoenfeld BJ, Beardsley C, Cronin J (2015).**
   "A comparison of gluteus maximus, biceps femoris, and vastus lateralis
   EMG activity in the back squat and barbell hip thrust." *J Appl Biomech*
   31(6):452–458. — Foundational hip-thrust EMG paper.

5. **Barbalho M, Coswig V, Souza D, Serrão JC, Hebling Campos M, Gentil P (2020).**
   "Back squat vs. hip thrust resistance-training programs in well-trained
   women." *Int J Sports Med*. — Long-term gluteal hypertrophy.

6. **Comfort P, Allen M, Graham-Smith P (2011).** "Kinetic comparisons during
   variations of the power clean." *J Strength Cond Res* 25(12):3269–3273.
   — Posterior-chain force outputs in heavy pulls.

7. **Marcolin G et al. (2018).** "Differences in EMG activity of biceps
   brachii and brachioradialis while performing three variants of curl."
   *PeerJ*. — Curl variant EMG comparisons.

8. **Saeterbakken AH, van den Tillaar R, Fimland MS (2011).** "A comparison
   of muscle activity and 1-RM strength of three chest-press exercises with
   different stability requirements." *J Sports Sci* 29(5):533–538.

9. **Fenwick CM, Brown SH, McGill SM (2009).** "Comparison of different
   rowing exercises: trunk muscle activation and lumbar spine motion, load,
   and stiffness." *J Strength Cond Res* 23(5):1408–1417.

10. **Signorile JF, Zink AJ, Szwed SP (2002).** "A comparative
    electromyographical investigation of muscle utilization patterns using
    various hand positions during the lat pull-down." *J Strength Cond Res*
    16(4):539–546.

11. **Saeterbakken AH, Fimland MS (2013).** "Effects of body position and
    loading modality on muscle activity and strength in shoulder presses."
    *J Strength Cond Res* 27(7):1824–1831.

12. **Ekstrom RA, Donatelli RA, Carp KC (2007).** "Electromyographic
    analysis of core trunk, hip, and thigh muscles during 9 rehabilitation
    exercises." *J Orthop Sports Phys Ther* 37(12):754–762.

13. **Vigotsky AD, Halperin I, Lehman GJ, Trajano GS, Vieira TM (2018).**
    "Interpreting signal amplitudes in surface electromyography studies in
    sport and rehabilitation sciences." *Front Physiol* 8:985.

14. **Schoenfeld BJ, Ogborn D, Krieger JW (2016).** "Effects of resistance
    training frequency on measures of muscle hypertrophy: A systematic
    review and meta-analysis." *Sports Med* 46(11):1689–1697.

15. **Marchetti PH, Uchida MC (2011).** "Effects of the pullover exercise
    on the pectoralis major and latissimus dorsi muscles as evaluated by
    EMG." *J Hum Kinet* 29:31–37.

## Position stands referenced

- **ACSM (Ratamess NA et al., 2009).** *Progression Models in Resistance
  Training for Healthy Adults.* The default reference for compound lift
  programming and progression.
- **ISSN (Jäger R et al., 2017).** *Protein and Exercise.* 1.4–2.0 g/kg/day
  of protein supports hypertrophy in trained individuals — the basis for
  the protein anchor in the macro-goal defaults.

## Foundational text

- **Bompa T, Buzzichelli C (2018).** *Periodization: Theory and Methodology
  of Training* (6th ed). Human Kinetics.

## How a score was computed (worked example: Barbell Bench Press)

```
emg            = 2.5  (high pec EMG across studies; Saeterbakken 2011)
hypertrophyMeta = 2.5 (large body of bench-press hypertrophy evidence)
replication     = 2.0 (decades of replication; one of the most-studied lifts)
practical       = 2.0 (universal use in trained populations)
                ----
Total           = 9.0 / 10
```

The score is computed by `computeResearchScore` in
`src/lib/exercise-mapping.ts`. Adjusting the breakdown automatically
updates the displayed score on the next seed run.

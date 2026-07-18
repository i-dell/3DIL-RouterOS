# Security Score Methodology

The score is explicitly partial. Its denominator is the sum of weights for verified controls, not every possible control.

`score = verified passing weight / verified assessed weight × 100`

Candidate controls are management authentication (20), firmware visibility (5), firewall state (20), and Wi-Fi encryption (20). A control with no trustworthy value is `unknown`, excluded from the denominator, and shown as unverified. A high partial score therefore does not claim complete router security.

Confidence is low below four verified controls, medium from four through seven, and high from eight. The UI displays the verified count, total candidate count, confidence, evidence, and incomplete-data warning.

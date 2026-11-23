# Glossary

## Timeline tool

**Team**
A group that owns Windows. Each Team gets its own lane in the Timeline.

**Window**
A named time range owned by exactly one Team, during which that Team's job may run. Either one-off or repeating.

**Repeat**
How a Window recurs: not at all, daily, or weekly on chosen weekdays. Nothing more elaborate.

**Overlap**
Time during which Windows of different Teams coincide. Surfacing Overlaps is the main purpose of the Timeline.

**Timeline**
The complete set of Teams and their Windows, shown together.

**Share Link**
A URL that carries an entire Timeline inside itself, so that opening it shows the same Timeline with nothing stored anywhere.

**Editor**
The mode in which a Timeline can be changed.

**Viewer**
The read-only mode a Share Link opens in. A Viewer cannot change the Timeline.

**UTC**
The time standard a Window is defined in. Every person sees the same Window, shown in their own local time zone.

**Swimlane**
The primary picture of a Timeline: one lane per Team, time running left to right, each Window a bar (a swimlane Gantt chart).

**Detail level**
How much the Swimlane's time axis shows, set automatically by how much time is on screen: hours, then days, then weeks and months. It is not a separate setting.

**Now marker**
A thin line on the Swimlane at the current moment.

**Person**
Someone assigned to Windows, identified only by their GitHub handle. Anyone who has the Share Link can see the handle.

**Assignee**
A Person responsible for a Window. A Window can have up to four.

**Service**
A shared system a Window touches, such as a database. Two Teams on the same Service at the same time is a real clash, not just a coincidence in time.

**Freeze**
A period in which no Window should run, for every Team. It is drawn as a band across all lanes.

**Conflict**
Anything the Timeline warns about. It is an error when a Window falls inside a Freeze, when two Teams use the same Service at once, or when a Person is double-booked. It is a warning when Windows only overlap in time.

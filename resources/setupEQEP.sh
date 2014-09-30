#!/usr/bin/bash

RESOURCES=/root/ECE597/resources
LIB=/lib/firmware
SLOTS=/sys/devices/bone_capemgr.*/slots

echo "Compiling up eQEP1 framework..."
OUT=$(ls $RESOURCES | grep bone_eqep1.dts)
if [[ $OUT -eq 0 ]]; then
	OUT=$(dtc -O dtb -o $RESOURCES/bone_eqep1-00A0.dtbo -b 0 -@ $RESOURCES/bone_eqep1.dts)
else
	echo "File $RESOURCES/bone_eqep1.dts does not exist."
fi

if [[ $OUT -eq 0 ]]; then
	echo "...success."
else
	echo "...failed."
	kill -SIGINT $$
fi

echo "Compiling eQEP2 framework..."
OUT=$(ls $RESOURCES | grep bone_eqep2.dts)
if [[ $OUT -eq 0 ]]; then
	OUT=$(dtc -O dtb -o $RESOURCES/bone_eqep2-00A0.dtbo -b 0 -@ $RESOURCES/bone_eqep2.dts)
else
	echo "File $RESOURCES/bone_eqep2.dts does not exist"
fi

if [[ $OUT -eq 0 ]]; then
	echo "...success."
else
	echo "...failed."
	kill -SIGINT $$
fi

echo "Copying files to $LIB..."
OUT=$(cp $RESOURCES/bone_eqep1-00A0.dtbo $LIB)
if [[ $OUT -eq 1 ]]; then
	echo "...failed for bone_eqep1-00A0.dtbo."
	kill -SIGINT $$
fi
OUT=$(cp $RESOURCES/bone_eqep2-00A0.dtbo $LIB)
if [[ $OUT -eq 1 ]]; then
	echo "...failed for bone_eqep2-00A0.dtbo."
	kill -SIGINT $$
fi
echo "...success."

echo "Adding to \$SLOTS..."
OUT=$(echo bone_eqep1 > $SLOTS)
if [[ $OUT -eq 1 ]]; then
	echo "...failed for bone_eqep1."
	kill -SIGINT $$
fi
OUT=$(echo bone_eqep2 > $SLOTS)
if [[ $OUT -eq 1 ]]; then
	echo "...failed for bone_eqep2."
	kill -SIGINT $$
fi
echo "...success."
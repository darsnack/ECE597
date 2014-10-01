#!/bin/bash

RESOURCES=/root/ECE597/resources
LIB=/lib/firmware
SLOTS=/sys/devices/bone_capemgr.*/slots

echo "Compiling up eQEP1 framework..."
ls $RESOURCES | grep bone_eqep1.dts
OUT=$?
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
ls $RESOURCES | grep bone_eqep2.dts
OUT=$?
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
cat $SLOTS | grep bone_eqep1 > /dev/null
OUT=$?
if [[ $OUT -eq 1 ]]; then
	OUT=$(echo bone_eqep1 > $SLOTS)
	if [[ $OUT -eq 1 ]]; then
		echo "...failed for bone_eqep1."
		kill -SIGINT $$
	fi
fi
cat $SLOTS | grep bone_eqep2 > /dev/null
OUT=$?
if [[ $OUT -eq 1 ]]; then
	OUT=$(echo bone_eqep2 > $SLOTS)
	if [[ $OUT -eq 1 ]]; then
		echo "...failed for bone_eqep2."
		kill -SIGINT $$
	fi
	echo "...success."
fi
echo "...success."
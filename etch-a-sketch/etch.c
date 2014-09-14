#include <stdio.h>
#include <stdlib.h>

#define ROW_SIZE 9
#define COL_SIZE 29

void clearSketch();
void drawSketch();

int bits[ROW_SIZE][COL_SIZE];
int currentRow, currentCol;

int main(int argc, char const *argv[]) {
	clearSketch();
	drawSketch();

	char input;
	while (1) {
		scanf(" %c", &input);
		getchar();
		switch(input) {
			case 't':
				printf("Exiting program...\n");
				return 0;
				break;
			case 'c':
			    clearSketch();
			    break;
			case 'w':
				if (currentRow <= 0) currentRow = 0;
				else currentRow--;
				break;
			case 'a':
				if (currentCol <= 0) currentCol = 0;
				else currentCol--;
				break;
			case 's':
				if (currentRow >= ROW_SIZE - 1) currentRow = ROW_SIZE - 1;
				else currentRow++;
				break;
			case 'd':
				if (currentCol >= COL_SIZE - 1) currentCol = COL_SIZE - 1;
				else currentCol++;
				break;
			case 'e':
			    if (currentCol >= COL_SIZE - 1 && currentRow <= 0) {
			        currentCol = COL_SIZE - 1;
			        currentRow = 0;
		        } else if (currentCol >= COL_SIZE - 1) {
		            currentCol = COL_SIZE - 1;
		            currentRow--;
		        } else if (currentRow <= 0) {
		            currentCol++;
		            currentRow = 0;
		        } else {
		            currentCol++;
		            currentRow--;
		        }
		        break;
            case 'q':
                if (currentCol <= 0 && currentRow <= 0) {
			        currentCol = 0;
			        currentRow = 0;
		        } else if (currentCol <= 0) {
		            currentCol = 0;
		            currentRow--;
		        } else if (currentRow <= 0) {
		            currentCol--;
		            currentRow = 0;
		        } else {
		            currentCol--;
		            currentRow--;
		        }
		        break;
		    case 'z':
		        if (currentCol >= 0 && currentRow <= ROW_SIZE - 1) {
			        currentCol = 0;
			        currentRow = ROW_SIZE - 1;
		        } else if (currentCol <= 0) {
		            currentCol = 0;
		            currentRow++;
		        } else if (currentRow >= ROW_SIZE - 1) {
		            currentCol--;
		            currentRow = 0;
		        } else {
		            currentCol--;
		            currentRow++;
		        }
		        break;
		    case 'x':
		        if (currentCol >= COL_SIZE - 1 && currentRow >= ROW_SIZE - 1) {
			        currentCol = COL_SIZE - 1;
			        currentRow = ROW_SIZE - 1;
		        } else if (currentCol >= COL_SIZE - 1) {
		            currentCol = COL_SIZE - 1;
		            currentRow++;
		        } else if (currentRow >= ROW_SIZE - 1) {
		            currentCol++;
		            currentRow = ROW_SIZE - 1;
		        } else {
		            currentCol++;
		            currentRow++;
		        }
		        break;
			default:
				printf("Improper input. Press enter...\n");
				getchar();
		}
		
		bits[currentRow][currentCol] = 1;

		drawSketch();
	}
	return 0;
}

void clearSketch() {
	system("clear");

	int row, col;
	for (row = 0; row < ROW_SIZE; row++) {
		for (col = 0; col < COL_SIZE; col++) {
			bits[row][col] = 0;
		}
	}
}

void drawSketch() {
    system("clear");
    
	int row, col;
	for (col = 0; col < COL_SIZE; col++) {
		printf("_");
	}
	printf("\n");

	for (row = 0; row < ROW_SIZE; row++) {
		printf("|");
		for (col = 0; col < COL_SIZE; col++) {
			if (row == currentRow && col == currentCol)
				printf("+");
			else if (bits[row][col])
				printf("x");
			else printf(" ");
		}
		printf("|\n");
	}

	for (col = 0; col < COL_SIZE; col++) {
		printf("_");
	}
	printf("\n");
}

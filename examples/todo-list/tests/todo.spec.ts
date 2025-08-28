import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('should add a new todo', async ({ page }) => {
  const todoText = 'Learn Playwright';
  
  // Fill in the todo input
  await page.locator('.todo-input').fill(todoText);
  
 // Click the add button
  await page.locator('.todo-add-btn').click();
  
  // Verify the todo is added to the list
 await expect(page.locator('.todo-item')).toHaveCount(1);
  await expect(page.locator('.todo-text')).toHaveText(todoText);
});

test('should toggle a todo completion status', async ({ page }) => {
  const todoText = 'Test toggle functionality';
  
  // Add a todo
  await page.locator('.todo-input').fill(todoText);
  await page.locator('.todo-add-btn').click();
  
  // Verify the todo is not completed initially
  const todoItem = page.locator('.todo-item');
  await expect(todoItem).not.toHaveClass(/completed/);
  
  // Click the todo text to toggle completion
  await page.locator('.todo-text').click();
  
  // Verify the todo is now completed
  await expect(todoItem).toHaveClass(/completed/);
  
  // Click again to toggle back to not completed
  await page.locator('.todo-text').click();
  
  // Verify the todo is not completed again
  await expect(todoItem).not.toHaveClass(/completed/);
});

test('should delete a todo', async ({ page }) => {
  const todoText = 'Delete me';
  
  // Add a todo
  await page.locator('.todo-input').fill(todoText);
  await page.locator('.todo-add-btn').click();
  
  // Verify the todo is in the list
  await expect(page.locator('.todo-item')).toHaveCount(1);
  
  // Click the delete button
  await page.locator('.todo-delete-btn').click();
  
  // Verify the todo is deleted
  await expect(page.locator('.todo-item')).toHaveCount(0);
});

test('should filter todos', async ({ page }) => {
  // Add some todos
  const todos = ['Todo 1', 'Todo 2', 'Todo 3'];
  
  for (const todo of todos) {
    await page.locator('.todo-input').fill(todo);
    await page.locator('.todo-add-btn').click();
  }
  
  // Toggle completion of the second todo
  await page.locator('.todo-item').nth(1).locator('.todo-text').click();
  
  // Check initial state - all todos should be visible
  await expect(page.locator('.todo-item')).toHaveCount(3);
  
  // Filter by active todos
  await page.locator('.filter-btn', { hasText: 'Active' }).click();
  await expect(page.locator('.todo-item')).toHaveCount(2);
  
  // Filter by completed todos
  await page.locator('.filter-btn', { hasText: 'Completed' }).click();
  await expect(page.locator('.todo-item')).toHaveCount(1);
  
  // Show all todos again
  await page.locator('.filter-btn', { hasText: 'All' }).click();
  await expect(page.locator('.todo-item')).toHaveCount(3);
});

test('should show correct item count', async ({ page }) => {
  // Initially, there should be 0 items left
  await expect(page.locator('.todo-count')).toHaveText('0 items left');
  
  // Add a todo
  await page.locator('.todo-input').fill('New todo');
  await page.locator('.todo-add-btn').click();
  
  // Now there should be 1 item left
  await expect(page.locator('.todo-count')).toHaveText('1 items left');
  
  // Add another todo
  await page.locator('.todo-input').fill('Another todo');
  await page.locator('.todo-add-btn').click();
  
  // Now there should be 2 items left
  await expect(page.locator('.todo-count')).toHaveText('2 items left');
  
  // Toggle completion of the first todo
  await page.locator('.todo-item').first().locator('.todo-text').click();
  
  // Now there should be 1 item left
  await expect(page.locator('.todo-count')).toHaveText('1 items left');
});

test('should display correct active and completed counts using useSelector', async ({ page }) => {
  // Initially, there should be 0 active and 0 completed
  await expect(page.locator('.todo-stats')).toContainText('Active: 0');
  await expect(page.locator('.todo-stats')).toContainText('Completed: 0');
  
  // Add a todo
  await page.locator('.todo-input').fill('New todo');
  await page.locator('.todo-add-btn').click();
  
  // Now there should be 1 active and 0 completed
  await expect(page.locator('.todo-stats')).toContainText('Active: 1');
  await expect(page.locator('.todo-stats')).toContainText('Completed: 0');
  
  // Add another todo
  await page.locator('.todo-input').fill('Another todo');
 await page.locator('.todo-add-btn').click();
  
  // Now there should be 2 active and 0 completed
  await expect(page.locator('.todo-stats')).toContainText('Active: 2');
  await expect(page.locator('.todo-stats')).toContainText('Completed: 0');
  
  // Toggle completion of the first todo
  await page.locator('.todo-item').first().locator('.todo-text').click();
  
  // Now there should be 1 active and 1 completed
  await expect(page.locator('.todo-stats')).toContainText('Active: 1');
  await expect(page.locator('.todo-stats')).toContainText('Completed: 1');
  
  // Delete the completed todo
  await page.locator('.todo-item.completed').locator('.todo-delete-btn').click();
  
  // Now there should be 1 active and 0 completed
  await expect(page.locator('.todo-stats')).toContainText('Active: 1');
  await expect(page.locator('.todo-stats')).toContainText('Completed: 0');
});

test('should edit a todo using the optional todo feature', async ({ page }) => {
  // Add a todo
  const originalText = 'Original todo text';
  await page.locator('.todo-input').fill(originalText);
  await page.locator('.todo-add-btn').click();
  
  // Verify the todo is added
  await expect(page.locator('.todo-item')).toHaveCount(1);
  await expect(page.locator('.todo-text')).toHaveText(originalText);
  
  // Click the edit button
  await page.locator('.todo-edit-btn').click();
  
  // Verify the todo editor is visible
  await expect(page.locator('.todo-editor')).toBeVisible();
  await expect(page.locator('.todo-editor input')).toHaveValue(originalText);
  
  // Edit the text
  const newText = 'Edited todo text';
  await page.locator('.todo-editor input').fill(newText);
  
  // Save the changes
  await page.locator('.todo-editor .todo-add-btn').click();
  
  // Verify the todo editor is hidden
  await expect(page.locator('.todo-editor')).not.toBeVisible();
  
 // Verify the todo text is updated
  await expect(page.locator('.todo-text')).toHaveText(newText);
});

test('should cancel editing a todo', async ({ page }) => {
  // Add a todo
  const originalText = 'Original todo text';
  await page.locator('.todo-input').fill(originalText);
  await page.locator('.todo-add-btn').click();
  
  // Click the edit button
  await page.locator('.todo-edit-btn').click();
  
  // Verify the todo editor is visible
  await expect(page.locator('.todo-editor')).toBeVisible();
  
  // Edit the text
  const newText = 'Edited todo text';
  await page.locator('.todo-editor input').fill(newText);
  
  // Cancel the changes
  await page.locator('.todo-editor .todo-delete-btn').click();
  
  // Verify the todo editor is hidden
  await expect(page.locator('.todo-editor')).not.toBeVisible();
  
 // Verify the todo text is not changed
  await expect(page.locator('.todo-text')).toHaveText(originalText);
});

test('should highlight the todo item being edited', async ({ page }) => {
  // Add two todos
  const firstTodoText = 'First todo';
  const secondTodoText = 'Second todo';
  await page.locator('.todo-input').fill(firstTodoText);
  await page.locator('.todo-add-btn').click();
  await page.locator('.todo-input').fill(secondTodoText);
  await page.locator('.todo-add-btn').click();
  
  // Verify both todos are added
  await expect(page.locator('.todo-item')).toHaveCount(2);
  
  // Verify neither todo is highlighted initially
  const todoItems = page.locator('.todo-item');
  await expect(todoItems.first()).not.toHaveClass(/editing/);
  await expect(todoItems.nth(1)).not.toHaveClass(/editing/);
  
  // Click the edit button on the first todo
  await page.locator('.todo-item').first().locator('.todo-edit-btn').click();
  
  // Verify the first todo is highlighted and the second is not
  await expect(todoItems.first()).toHaveClass(/editing/);
  await expect(todoItems.nth(1)).not.toHaveClass(/editing/);
  
  // Cancel the edit
  await page.locator('.todo-editor .todo-delete-btn').click();
  
  // Verify neither todo is highlighted after canceling
  await expect(todoItems.first()).not.toHaveClass(/editing/);
  await expect(todoItems.nth(1)).not.toHaveClass(/editing/);
});

test('should remove highlight from todo item after saving', async ({ page }) => {
  // Add a todo
  const originalText = 'Original todo text';
  await page.locator('.todo-input').fill(originalText);
  await page.locator('.todo-add-btn').click();
  
  // Verify the todo is added
  await expect(page.locator('.todo-item')).toHaveCount(1);
  
  // Verify the todo is not highlighted initially
  const todoItem = page.locator('.todo-item');
  await expect(todoItem).not.toHaveClass(/editing/);
  
  // Click the edit button
  await page.locator('.todo-edit-btn').click();
  
  // Verify the todo is highlighted
  await expect(todoItem).toHaveClass(/editing/);
  
  // Edit the text
  const newText = 'Edited todo text';
  await page.locator('.todo-editor input').fill(newText);
  
  // Save the changes
  await page.locator('.todo-editor .todo-add-btn').click();
  
  // Verify the todo is not highlighted after saving
  await expect(todoItem).not.toHaveClass(/editing/);
});